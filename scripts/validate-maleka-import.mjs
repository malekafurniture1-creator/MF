import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const UPLOAD_ROOT = path.join(ROOT, "img_upload");
const ENHANCED_ROOT = path.join(UPLOAD_ROOT, "ENHANCED");
const MANIFEST_PATH = path.join(UPLOAD_ROOT, "stage2_manifest.json");
const PLAN_PATH = path.join(UPLOAD_ROOT, "import_plan.json");
const EXPECTED_CATEGORIES = [
  "Beds",
  "Dining",
  "Mirrors",
  "Shoe Racks & Storage",
  "Sofas",
  "Wardrobes",
  "Wedding Sets",
];
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const MAX_BYTES = 3 * 1024 * 1024;
const UUID_NAMESPACE = "7690148e-448c-5bd1-944c-57fe563f1378";
const PROXY_BASE = "https://maleka-image-proxy.malekafurniture1.workers.dev";

function loadEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

function uuidToBytes(uuid) {
  return Buffer.from(uuid.replaceAll("-", ""), "hex");
}

function uuidV5(name, namespace = UUID_NAMESPACE) {
  const hash = createHash("sha1").update(uuidToBytes(namespace)).update(name, "utf8").digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function normalizedRelative(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "").normalize("NFC");
}

function safeBasename(filename) {
  return path.basename(filename, path.extname(filename)).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80);
}

async function walkFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walkFiles(full));
    else if (entry.isFile()) output.push(full);
  }
  return output;
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) continue;
    if (offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3), format: "jpeg" };
    }
    offset += length;
  }
  return null;
}

function pngDimensions(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), format: "png" };
}

function webpDimensions(buffer) {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  const kind = buffer.toString("ascii", 12, 16);
  if (kind === "VP8X") {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
      format: "webp",
    };
  }
  if (kind === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff), format: "webp" };
  }
  if (kind === "VP8 ") {
    for (let i = 20; i + 9 < buffer.length; i += 1) {
      if (buffer[i] === 0x9d && buffer[i + 1] === 0x01 && buffer[i + 2] === 0x2a) {
        return { width: buffer.readUInt16LE(i + 3) & 0x3fff, height: buffer.readUInt16LE(i + 5) & 0x3fff, format: "webp" };
      }
    }
  }
  return null;
}

async function imageMetadata(file) {
  const buffer = await readFile(file);
  const dimensions = jpegDimensions(buffer) || pngDimensions(buffer) || webpDimensions(buffer);
  return { buffer, dimensions };
}

async function fetchLiveCategories(env) {
  const base = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) throw new Error("Missing Supabase URL or read credential in .env");
  const response = await fetch(`${base}/rest/v1/categories?select=id,name,slug,visible,sort_order&order=sort_order.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`Live Supabase category read failed (${response.status})`);
  return response.json();
}

async function fetchExistingProductIds(env, ids) {
  const base = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const existing = new Set();
  for (let start = 0; start < ids.length; start += 50) {
    const chunk = ids.slice(start, start + 50);
    const filter = encodeURIComponent(`(${chunk.join(",")})`);
    const response = await fetch(`${base}/rest/v1/products?select=id&id=in.${filter}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) throw new Error(`Existing-product identity check failed (${response.status})`);
    for (const row of await response.json()) existing.add(row.id);
  }
  return existing;
}

async function authorizeB2(env) {
  const keyId = env.B2_KEY_ID;
  const applicationKey = env.B2_APPLICATION_KEY;
  if (!keyId || !applicationKey) throw new Error("Missing B2 read credentials in .env");
  const authorization = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");
  const response = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
    headers: { Authorization: `Basic ${authorization}` },
  });
  if (!response.ok) throw new Error(`B2 authorization failed (${response.status})`);
  return response.json();
}

async function fetchExistingB2Keys(env) {
  const auth = await authorizeB2(env);
  const storage = auth.apiInfo?.storageApi;
  if (!storage?.apiUrl) throw new Error("B2 authorization response did not include the storage API");
  let bucketId = storage.bucketId;
  if (!bucketId) {
    const response = await fetch(`${storage.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: "POST",
      headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: auth.accountId }),
    });
    if (!response.ok) throw new Error(`B2 bucket lookup failed (${response.status})`);
    const buckets = (await response.json()).buckets || [];
    bucketId = buckets.find((bucket) => bucket.bucketName === env.B2_BUCKET_NAME)?.bucketId;
  }
  if (!bucketId) throw new Error("Configured B2 bucket was not found");

  const keys = new Set();
  let nextFileName;
  do {
    const response = await fetch(`${storage.apiUrl}/b2api/v3/b2_list_file_names`, {
      method: "POST",
      headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" },
      body: JSON.stringify({ bucketId, prefix: "products/", startFileName: nextFileName, maxFileCount: 1000 }),
    });
    if (!response.ok) throw new Error(`B2 object conflict check failed (${response.status})`);
    const page = await response.json();
    for (const file of page.files || []) keys.add(file.fileName);
    nextFileName = page.nextFileName || undefined;
  } while (nextFileName);
  return keys;
}

function duplicateValues(items, selector) {
  const counts = new Map();
  for (const item of items) {
    const value = selector(item);
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([value]) => value));
}

async function main() {
  const env = loadEnv(await readFile(path.join(ROOT, ".env"), "utf8"));
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(manifest)) throw new Error("stage2_manifest.json must contain a JSON array");

  const actualFiles = await walkFiles(ENHANCED_ROOT);
  const actualByRelative = new Map(actualFiles.map((file) => [
    normalizedRelative(path.relative(UPLOAD_ROOT, file)).toLocaleLowerCase("en-US"),
    file,
  ]));
  const liveCategories = await fetchLiveCategories(env);
  const liveByName = new Map(liveCategories.map((category) => [category.name, category]));
  const suppliedFolders = new Set((await readdir(ENHANCED_ROOT, { withFileTypes: true })).filter((x) => x.isDirectory()).map((x) => x.name));

  const preliminary = [];
  for (const record of manifest) {
    const issues = [];
    const warnings = [];
    const sourceFilename = typeof record.original_file === "string" ? record.original_file.trim() : "";
    const enhancedPath = typeof record.enhanced_path === "string" ? normalizedRelative(record.enhanced_path.trim()) : "";
    const category = typeof record.category === "string" ? record.category.trim() : "";
    const caption = typeof record.caption === "string" ? record.caption.trim().replace(/\s+/g, " ") : "";
    const identity = `maleka-stage2:${enhancedPath.toLocaleLowerCase("en-US")}`;
    const productId = uuidV5(identity);
    const objectKey = `products/${productId}/0-${safeBasename(sourceFilename || enhancedPath)}.webp`;
    const file = actualByRelative.get(enhancedPath.toLocaleLowerCase("en-US"));

    if (!sourceFilename) issues.push("missing source filename");
    if (!enhancedPath || !file) issues.push("enhanced image not found");
    if (sourceFilename && enhancedPath && path.basename(enhancedPath).toLocaleLowerCase("en-US") !== sourceFilename.toLocaleLowerCase("en-US")) {
      issues.push("source filename does not match enhanced path basename");
    }
    if (!EXPECTED_CATEGORIES.includes(category)) issues.push("category is not one of the seven supplied categories");
    if (!suppliedFolders.has(category)) issues.push("category folder is missing");
    if (!liveByName.has(category)) issues.push("category does not exist in live Supabase");
    else if (!liveByName.get(category).visible) issues.push("live Supabase category is not visible");
    if (!caption) issues.push("caption/product name is blank");
    else if (caption.length > 120) issues.push("caption/product name exceeds 120 characters");

    let metadata = null;
    if (file) {
      const fileStat = await stat(file);
      const extension = path.extname(file).toLocaleLowerCase("en-US");
      if (!ALLOWED_EXTENSIONS.has(extension)) issues.push(`unsupported file extension: ${extension || "none"}`);
      if (fileStat.size <= 0) issues.push("image file is empty");
      if (fileStat.size > MAX_BYTES) issues.push(`image exceeds ${MAX_BYTES} bytes`);
      const inspected = await imageMetadata(file);
      metadata = inspected.dimensions ? { ...inspected.dimensions, bytes: fileStat.size } : { bytes: fileStat.size };
      if (!inspected.dimensions) issues.push("image dimensions or file signature could not be read");
      else {
        const ratio = inspected.dimensions.width / inspected.dimensions.height;
        if (Math.abs(ratio - 0.8) > 0.0001) issues.push("image aspect ratio is not 4:5");
        if (inspected.dimensions.width < 1200 || inspected.dimensions.height < 1500) issues.push("image is smaller than 1200x1500");
        if ((extension === ".jpg" || extension === ".jpeg") && inspected.dimensions.format !== "jpeg") issues.push("file extension and signature conflict");
        if (extension === ".png" && inspected.dimensions.format !== "png") issues.push("file extension and signature conflict");
        if (extension === ".webp" && inspected.dimensions.format !== "webp") issues.push("file extension and signature conflict");
      }
    }

    preliminary.push({ sourceFilename, enhancedPath, category, caption, productId, objectKey, metadata, issues, warnings });
  }

  const duplicateSources = duplicateValues(preliminary, (row) => row.sourceFilename.toLocaleLowerCase("en-US"));
  const duplicatePaths = duplicateValues(preliminary, (row) => row.enhancedPath.toLocaleLowerCase("en-US"));
  const duplicateIds = duplicateValues(preliminary, (row) => row.productId);
  const duplicateKeys = duplicateValues(preliminary, (row) => row.objectKey);
  const duplicateCaptions = duplicateValues(preliminary, (row) => `${row.category}\0${row.caption.toLocaleLowerCase("en-US")}`);
  const existingProductIds = await fetchExistingProductIds(env, preliminary.map((row) => row.productId));
  const existingB2Keys = await fetchExistingB2Keys(env);

  for (const row of preliminary) {
    if (duplicateSources.has(row.sourceFilename.toLocaleLowerCase("en-US"))) row.issues.push("duplicate source filename identity");
    if (duplicatePaths.has(row.enhancedPath.toLocaleLowerCase("en-US"))) row.issues.push("duplicate enhanced path identity");
    if (duplicateIds.has(row.productId)) row.issues.push("deterministic product UUID collision");
    if (duplicateKeys.has(row.objectKey)) row.issues.push("deterministic B2 object-key collision");
    if (existingProductIds.has(row.productId)) row.issues.push("planned product UUID already exists in Supabase");
    if (existingB2Keys.has(row.objectKey)) row.issues.push("planned B2 object key already exists");
    if (duplicateCaptions.has(`${row.category}\0${row.caption.toLocaleLowerCase("en-US")}`)) {
      row.warnings.push("caption is shared by another image in the same category; records remain separate products");
    }
  }

  const manifestPaths = new Set(preliminary.map((row) => row.enhancedPath.toLocaleLowerCase("en-US")));
  const unreferencedFiles = [...actualByRelative.keys()].filter((relative) => !manifestPaths.has(relative));
  const categoryProblems = [];
  for (const expected of EXPECTED_CATEGORIES) {
    if (!suppliedFolders.has(expected)) categoryProblems.push(`missing supplied category folder: ${expected}`);
    if (!liveByName.has(expected)) categoryProblems.push(`missing live Supabase category: ${expected}`);
  }
  for (const folder of suppliedFolders) {
    if (!EXPECTED_CATEGORIES.includes(folder)) categoryProblems.push(`unexpected category folder: ${folder}`);
  }
  if (unreferencedFiles.length) categoryProblems.push(`${unreferencedFiles.length} enhanced image(s) are not referenced by the manifest`);

  const records = preliminary.map((row) => ({
    source_filename: row.sourceFilename,
    enhanced_path: row.enhancedPath,
    category: row.category,
    product_name: row.caption,
    planned_product_uuid: row.productId,
    planned_b2_object_key: row.objectKey,
    primary_image: {
      is_primary: true,
      sort_order: 0,
      planned_format: "image/webp",
      planned_width: 1200,
      planned_height: 1500,
      planned_url: `${PROXY_BASE}/images/${row.objectKey}`,
    },
    source_image: row.metadata,
    import_status: row.issues.length || categoryProblems.length ? "blocked" : "ready",
    issues: row.issues,
    warnings: row.warnings,
  }));

  const countsByCategory = Object.fromEntries(EXPECTED_CATEGORIES.map((category) => [
    category,
    records.filter((row) => row.category === category && row.import_status === "ready").length,
  ]));
  const conflicts = records.flatMap((row) => row.issues.map((issue) => ({ source_filename: row.source_filename, issue })));
  const warnings = records.flatMap((row) => row.warnings.map((warning) => ({ source_filename: row.source_filename, warning })));
  const plan = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    source_manifest: "img_upload/stage2_manifest.json",
    source_directory: "img_upload/ENHANCED",
    mode: "preparation-only-no-remote-writes",
    summary: {
      manifest_records: manifest.length,
      enhanced_images: actualFiles.length,
      valid_records: records.filter((row) => row.import_status === "ready").length,
      blocked_records: records.filter((row) => row.import_status === "blocked").length,
      counts_by_category: countsByCategory,
      category_problems: categoryProblems,
      conflict_count: conflicts.length,
      warning_count: warnings.length,
    },
    records,
  };

  await writeFile(PLAN_PATH, `${JSON.stringify(plan, null, 2)}\n`, "utf8");

  console.log("MALEKA import validation report");
  console.log(`Manifest records: ${plan.summary.manifest_records}`);
  console.log(`Enhanced images: ${plan.summary.enhanced_images}`);
  console.log(`Valid records: ${plan.summary.valid_records}`);
  console.log(`Blocked records: ${plan.summary.blocked_records}`);
  console.log("Ready records by category:");
  for (const [category, count] of Object.entries(countsByCategory)) console.log(`  ${category}: ${count}`);
  console.log(`Identity/object conflicts: ${conflicts.length}`);
  for (const conflict of conflicts) console.log(`  BLOCKED ${conflict.source_filename}: ${conflict.issue}`);
  for (const problem of categoryProblems) console.log(`  BLOCKED category/filesystem: ${problem}`);
  console.log(`Warnings: ${warnings.length}`);
  for (const warning of warnings) console.log(`  WARNING ${warning.source_filename}: ${warning.warning}`);
  console.log(`Plan written: ${path.relative(ROOT, PLAN_PATH).replaceAll("\\", "/")}`);

  if (plan.summary.blocked_records || categoryProblems.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
