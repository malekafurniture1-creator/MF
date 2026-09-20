import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, "img_upload", "import_plan.json");
const APPLY = process.argv.includes("--apply");
const EXPECTED_COUNT = 346;
const CONCURRENCY = 4;

function loadEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[match[1]] = value;
  }
  return values;
}

function uuidToBytes(uuid) {
  return Buffer.from(uuid.replaceAll("-", ""), "hex");
}

function uuidV5(name, namespace) {
  const hash = createHash("sha1").update(uuidToBytes(namespace)).update(name, "utf8").digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function prepareImage(record) {
  const sourcePath = path.join(ROOT, "img_upload", ...record.enhanced_path.split("/"));
  const buffer = await sharp(sourcePath)
    .resize(1200, 1500, { fit: "cover", position: "centre" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 86 })
    .toBuffer();
  return { buffer, sha1: createHash("sha1").update(buffer).digest("hex") };
}

async function authorizeB2(env) {
  if (!env.B2_KEY_ID || !env.B2_APPLICATION_KEY || !env.B2_BUCKET_NAME) throw new Error("Missing required B2 configuration");
  const authorization = Buffer.from(`${env.B2_KEY_ID}:${env.B2_APPLICATION_KEY}`).toString("base64");
  const response = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", { headers: { Authorization: `Basic ${authorization}` } });
  if (!response.ok) throw new Error(`B2 authorization failed (${response.status})`);
  const auth = await response.json();
  const storage = auth.apiInfo?.storageApi;
  if (!storage?.apiUrl) throw new Error("B2 storage API configuration is unavailable");
  let bucketId = storage.bucketId;
  if (!bucketId) {
    const list = await fetch(`${storage.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: "POST",
      headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: auth.accountId }),
    });
    if (!list.ok) throw new Error(`B2 bucket lookup failed (${list.status})`);
    bucketId = (await list.json()).buckets?.find((bucket) => bucket.bucketName === env.B2_BUCKET_NAME)?.bucketId;
  }
  if (!bucketId) throw new Error("Configured B2 bucket was not found");
  return { apiUrl: storage.apiUrl, authorizationToken: auth.authorizationToken, bucketId };
}

async function listB2Objects(auth) {
  const objects = new Map();
  let nextFileName;
  do {
    const response = await fetch(`${auth.apiUrl}/b2api/v3/b2_list_file_names`, {
      method: "POST",
      headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" },
      body: JSON.stringify({ bucketId: auth.bucketId, prefix: "products/", startFileName: nextFileName, maxFileCount: 1000 }),
    });
    if (!response.ok) throw new Error(`B2 object listing failed (${response.status})`);
    const page = await response.json();
    for (const file of page.files || []) objects.set(file.fileName, file);
    nextFileName = page.nextFileName || undefined;
  } while (nextFileName);
  return objects;
}

async function getUploadUrl(auth) {
  const response = await fetch(`${auth.apiUrl}/b2api/v3/b2_get_upload_url`, {
    method: "POST",
    headers: { Authorization: auth.authorizationToken, "Content-Type": "application/json" },
    body: JSON.stringify({ bucketId: auth.bucketId }),
  });
  if (!response.ok) throw new Error(`B2 upload URL request failed (${response.status})`);
  return response.json();
}

async function uploadObject(upload, key, prepared) {
  const response = await fetch(upload.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: upload.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(key),
      "Content-Type": "image/webp",
      "Content-Length": String(prepared.buffer.length),
      "X-Bz-Content-Sha1": prepared.sha1,
    },
    body: prepared.buffer,
  });
  if (!response.ok) throw new Error(`B2 upload failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  return response.json();
}

function supabaseConfig(env) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

async function getRows(config, table, column, values, select) {
  const rows = [];
  for (let start = 0; start < values.length; start += 40) {
    const chunk = values.slice(start, start + 40);
    const filter = encodeURIComponent(`(${chunk.join(",")})`);
    const response = await fetch(`${config.url}/rest/v1/${table}?select=${select}&${column}=in.${filter}`, { headers: config.headers });
    if (!response.ok) throw new Error(`Supabase ${table} preflight read failed (${response.status})`);
    rows.push(...await response.json());
  }
  return rows;
}

async function insertRow(config, table, row) {
  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...config.headers, Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!response.ok) throw new Error(`Supabase ${table} insert failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
}

function sameProduct(existing, expected) {
  return existing.id === expected.id && existing.name === expected.name && existing.category === expected.category &&
    existing.image_url === expected.image_url && existing.visible === false && existing.featured === false &&
    existing.sort_order === 0 && existing.description === null && JSON.stringify(existing.tags || []) === "[]";
}

function sameProductImage(existing, expected) {
  return existing.id === expected.id && existing.product_id === expected.product_id && existing.image_url === expected.image_url &&
    existing.sort_order === 0 && existing.is_primary === true;
}

async function runPool(items, worker, concurrency = CONCURRENCY) {
  let next = 0;
  const results = new Array(items.length);
  async function runner(workerIndex) {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index, workerIndex);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, (_, index) => runner(index)));
  return results;
}

async function main() {
  const env = loadEnv(await readFile(path.join(ROOT, ".env"), "utf8"));
  const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
  if (plan.summary?.valid_records !== EXPECTED_COUNT || plan.summary?.blocked_records !== 0 || plan.records?.length !== EXPECTED_COUNT) {
    throw new Error(`Plan gate failed: expected ${EXPECTED_COUNT}/${EXPECTED_COUNT} ready and 0 blocked`);
  }
  const records = plan.records;
  const blockers = [];
  const seenIds = new Set();
  const seenKeys = new Set();
  for (const record of records) {
    if (record.import_status !== "ready" || record.issues?.length) blockers.push(`${record.source_filename}: plan record is not ready`);
    if (seenIds.has(record.planned_product_uuid)) blockers.push(`${record.source_filename}: duplicate planned product UUID`);
    if (seenKeys.has(record.planned_b2_object_key)) blockers.push(`${record.source_filename}: duplicate planned B2 key`);
    seenIds.add(record.planned_product_uuid);
    seenKeys.add(record.planned_b2_object_key);
  }

  console.log(`Preparing and hashing ${records.length} planned WebP images without modifying source files...`);
  const prepared = await runPool(records, (record) => prepareImage(record));
  const b2 = await authorizeB2(env);
  const [existingObjects, config] = await Promise.all([listB2Objects(b2), Promise.resolve(supabaseConfig(env))]);
  const productIds = records.map((record) => record.planned_product_uuid);
  const imageIds = records.map((record) => uuidV5("primary-image", record.planned_product_uuid));
  const [products, productImages] = await Promise.all([
    getRows(config, "products", "id", productIds, "id,name,category,description,image_url,featured,visible,tags,sort_order"),
    getRows(config, "product_images", "id", imageIds, "id,product_id,image_url,sort_order,is_primary"),
  ]);
  const productsById = new Map(products.map((row) => [row.id, row]));
  const imagesById = new Map(productImages.map((row) => [row.id, row]));
  const actions = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const imageId = imageIds[index];
    const expectedUrl = record.primary_image.planned_url;
    const expectedProduct = {
      id: record.planned_product_uuid,
      name: record.product_name,
      category: record.category,
      description: null,
      image_url: expectedUrl,
      featured: false,
      visible: false,
      tags: [],
      sort_order: 0,
    };
    const expectedImage = {
      id: imageId,
      product_id: record.planned_product_uuid,
      image_url: expectedUrl,
      sort_order: 0,
      is_primary: true,
    };
    const object = existingObjects.get(record.planned_b2_object_key);
    if (object && object.contentSha1 !== prepared[index].sha1) blockers.push(`${record.source_filename}: existing B2 object has different content`);
    const product = productsById.get(expectedProduct.id);
    if (product && !sameProduct(product, expectedProduct)) blockers.push(`${record.source_filename}: existing product UUID has conflicting data`);
    const productImage = imagesById.get(expectedImage.id);
    if (productImage && !sameProductImage(productImage, expectedImage)) blockers.push(`${record.source_filename}: existing product_images UUID has conflicting data`);
    if (productImage && !product) blockers.push(`${record.source_filename}: product image exists without its planned product`);
    actions.push({ record, prepared: prepared[index], expectedProduct, expectedImage, objectExists: Boolean(object), productExists: Boolean(product), imageExists: Boolean(productImage) });
  }

  const duplicateCaptionRecords = records.filter((record) => record.warnings?.some((warning) => warning.includes("caption is shared"))).length;
  console.log("Stage 3 importer dry-run");
  console.log(`Ready: ${records.length - blockers.length}/${records.length}`);
  console.log(`Blockers: ${blockers.length}`);
  console.log(`Duplicate-caption records kept separate: ${duplicateCaptionRecords}`);
  console.log(`B2 uploads required: ${actions.filter((x) => !x.objectExists).length}`);
  console.log(`Supabase products required: ${actions.filter((x) => !x.productExists).length}`);
  console.log(`Supabase product_images required: ${actions.filter((x) => !x.imageExists).length}`);
  for (const blocker of blockers) console.log(`  BLOCKED ${blocker}`);
  if (blockers.length) throw new Error("Dry-run failed; no writes were attempted");
  if (!APPLY) {
    console.log("Dry-run passed. No remote writes performed (use --apply to import).");
    return;
  }

  console.log("Dry-run passed with 346/346 ready and 0 blockers. Starting live import...");
  const counters = { b2Uploaded: 0, b2Skipped: 0, productsCreated: 0, productsSkipped: 0, imagesCreated: 0, imagesSkipped: 0, failures: [] };
  await runPool(actions, async (action) => {
    try {
      if (!action.objectExists) {
        const upload = await getUploadUrl(b2);
        const result = await uploadObject(upload, action.record.planned_b2_object_key, action.prepared);
        if (result.contentSha1 !== action.prepared.sha1) throw new Error("B2 returned a content checksum mismatch");
        counters.b2Uploaded += 1;
      } else counters.b2Skipped += 1;

      if (!action.productExists) {
        await insertRow(config, "products", action.expectedProduct);
        counters.productsCreated += 1;
      } else counters.productsSkipped += 1;

      if (!action.imageExists) {
        await insertRow(config, "product_images", action.expectedImage);
        counters.imagesCreated += 1;
      } else counters.imagesSkipped += 1;
    } catch (error) {
      counters.failures.push({ source_filename: action.record.source_filename, error: error instanceof Error ? error.message : String(error) });
    }
  });

  console.log("Stage 3 live import result");
  console.log(`B2 uploaded: ${counters.b2Uploaded}; already present: ${counters.b2Skipped}`);
  console.log(`Supabase products created: ${counters.productsCreated}; already present: ${counters.productsSkipped}`);
  console.log(`Supabase product_images created: ${counters.imagesCreated}; already present: ${counters.imagesSkipped}`);
  console.log(`Failures: ${counters.failures.length}`);
  for (const failure of counters.failures) console.log(`  FAILED ${failure.source_filename}: ${failure.error}`);
  if (counters.failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Importer failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
