// src/lib/b2.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Helper utilities for interacting with Backblaze B2 via its Native API.
 * Secrets are read from environment variables; they must be available only on the server.
 */

function getEnv(name: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name]!;
  }
  if (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env[name]) {
    return (import.meta as any).env[name];
  }
  return fallback;
}

const SUPABASE_URL = () =>
  getEnv("SUPABASE_URL") ||
  getEnv("VITE_SUPABASE_URL", "https://widcvaewssipsgactrss.supabase.co");

const SUPABASE_PUBLISHABLE_KEY = () =>
  getEnv("SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_9-eWEAFnPtWrDiO08HJGNQ__m7C7xsP");

const B2_ENDPOINT = () => getEnv("B2_ENDPOINT", "https://s3.us-east-005.backblazeb2.com");
const B2_BUCKET = () => getEnv("B2_BUCKET_NAME", "maleka-furniture-images");
const B2_KEY_ID = () => getEnv("B2_KEY_ID", "00562c2c417c0cb0000000002");
const B2_APP_KEY = () => getEnv("B2_APPLICATION_KEY", "K005DCe8Rhtef4dcDuLn+tL/9oKrJd4");

/**
 * Public proxy base for images.
 */
export const PROXY_BASE = "https://maleka-image-proxy.malekafurniture1.workers.dev";
export function proxyUrl(key: string): string {
  return `${PROXY_BASE}/images/${key}`;
}

/**
 * Generate a collision-safe object key.
 */
export function makeObjectKey(prefix: string, filename: string): string {
  const random = crypto.randomUUID().slice(0, 8);
  const cleanExt = filename.includes(".") ? filename.split(".").pop() || "webp" : "webp";
  const safeName = filename.replace(/\.[^.]+$/, "").replace(/[^\w.-]/g, "_").slice(0, 30);
  const cleanPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return `${cleanPrefix}${safeName ? `${safeName}-` : ""}${random}.${cleanExt}`;
}

export function extractB2Key(urlOrKey: string): string | null {
  if (!urlOrKey) return null;
  if (!urlOrKey.startsWith("http://") && !urlOrKey.startsWith("https://")) {
    return urlOrKey;
  }
  const proxyMarker = "/images/";
  if (urlOrKey.includes(proxyMarker)) {
    return urlOrKey.split(proxyMarker)[1] || null;
  }
  return null;
}

let cachedAuth: {
  apiUrl: string;
  authorizationToken: string;
  bucketId: string;
  expiresAt: number;
} | null = null;

// Cache the B2 upload URL so we don't need a round-trip on every upload
let cachedUploadUrl: {
  uploadUrl: string;
  authorizationToken: string;
  expiresAt: number;
} | null = null;

/**
 * Authorize with Backblaze B2 Native API.
 */
async function getB2Auth() {
  const now = Date.now();
  if (cachedAuth && cachedAuth.expiresAt > now + 60000) {
    return cachedAuth;
  }

  const keyId = B2_KEY_ID();
  const appKey = B2_APP_KEY();
  const basicAuth = btoa(`${keyId}:${appKey}`);

  const resp = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`B2 Authorization failed (${resp.status}): ${errText}`);
  }

  const data = await resp.json();
  const storageApi = data.apiInfo?.storageApi;
  let bucketId = storageApi?.bucketId;

  if (!bucketId) {
    const targetBucketName = B2_BUCKET();
    const listResp = await fetch(`${storageApi.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: "POST",
      headers: { Authorization: data.authorizationToken },
      body: JSON.stringify({ accountId: data.accountId }),
    });
    if (listResp.ok) {
      const listData = await listResp.json();
      const found = listData.buckets?.find((b: any) => b.bucketName === targetBucketName);
      if (found) bucketId = found.bucketId;
    }
  }

  // Invalidate upload URL cache when we re-auth
  cachedUploadUrl = null;

  cachedAuth = {
    apiUrl: storageApi.apiUrl,
    authorizationToken: data.authorizationToken,
    bucketId: bucketId || "e6124c629c848177ac000c1b",
    expiresAt: now + 20 * 3600 * 1000,
  };

  return cachedAuth;
}

/**
 * Get (and cache) a B2 upload URL. B2 upload URLs can be reused for multiple
 * uploads to the same bucket within the same session — no need to fetch one
 * per file.
 */
async function getUploadUrl() {
  const now = Date.now();
  if (cachedUploadUrl && cachedUploadUrl.expiresAt > now + 30000) {
    return cachedUploadUrl;
  }

  const auth = await getB2Auth();
  const uploadUrlResp = await fetch(`${auth.apiUrl}/b2api/v3/b2_get_upload_url`, {
    method: "POST",
    headers: { Authorization: auth.authorizationToken },
    body: JSON.stringify({ bucketId: auth.bucketId }),
  });

  if (!uploadUrlResp.ok) {
    const err = await uploadUrlResp.text();
    throw new Error(`Failed to get B2 upload URL (${uploadUrlResp.status}): ${err}`);
  }

  const uploadUrlData = await uploadUrlResp.json();
  // B2 upload URLs are valid for 24h but can become stale after errors; cache for 1h
  cachedUploadUrl = {
    uploadUrl: uploadUrlData.uploadUrl,
    authorizationToken: uploadUrlData.authorizationToken,
    expiresAt: now + 60 * 60 * 1000,
  };

  return cachedUploadUrl;
}

/**
 * Compute SHA1 hex digest using standard Web Crypto API.
 */
async function computeSha1(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Upload binary data / WebP to B2.
 */
export async function uploadToB2(
  key: string,
  data: ArrayBuffer,
  contentType = "image/webp",
): Promise<string> {
  // Get cached upload URL (avoids a round-trip on warm requests)
  let uploadInfo = await getUploadUrl();
  const sha1 = await computeSha1(data);

  // Upload file — if the cached URL has expired/errored, invalidate and retry once
  let uploadResp = await fetch(uploadInfo.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: uploadInfo.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(key),
      "Content-Type": contentType,
      "Content-Length": String(data.byteLength),
      "X-Bz-Content-Sha1": sha1,
    },
    body: data,
  });

  // B2 returns 401/503 when an upload URL is stale — refresh and retry once
  if (!uploadResp.ok && (uploadResp.status === 401 || uploadResp.status === 503)) {
    cachedUploadUrl = null;
    uploadInfo = await getUploadUrl();
    uploadResp = await fetch(uploadInfo.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadInfo.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(key),
        "Content-Type": contentType,
        "Content-Length": String(data.byteLength),
        "X-Bz-Content-Sha1": sha1,
      },
      body: data,
    });
  }

  if (!uploadResp.ok) {
    const err = await uploadResp.text();
    throw new Error(`B2 file upload failed (${uploadResp.status}): ${err}`);
  }

  return key;
}

/**
 * Delete an object from B2.
 */
export async function deleteFromB2(key: string): Promise<void> {
  const auth = await getB2Auth();

  // List file versions to get fileId
  const listResp = await fetch(`${auth.apiUrl}/b2api/v3/b2_list_file_names`, {
    method: "POST",
    headers: { Authorization: auth.authorizationToken },
    body: JSON.stringify({
      bucketId: auth.bucketId,
      startFileName: key,
      maxFileCount: 1,
      prefix: key,
    }),
  });

  if (listResp.ok) {
    const listData = await listResp.json();
    const file = listData.files?.find((f: any) => f.fileName === key);
    if (file?.fileId) {
      await fetch(`${auth.apiUrl}/b2api/v3/b2_delete_file_version`, {
        method: "POST",
        headers: { Authorization: auth.authorizationToken },
        body: JSON.stringify({
          fileName: key,
          fileId: file.fileId,
        }),
      });
    }
  }
}

// Short-lived cache for verified owner tokens (avoids 2 Supabase RTTs per upload)
const ownerTokenCache = new Map<string, { userId: string; expiresAt: number }>();

/**
 * Verify owner identity and role from a Supabase JWT.
 */
export async function verifyOwner(token: string): Promise<{ userId: string }> {
  const now = Date.now();
  const cached = ownerTokenCache.get(token);
  if (cached && cached.expiresAt > now) {
    return { userId: cached.userId };
  }

  const supabaseUrl = SUPABASE_URL();
  const publishableKey = SUPABASE_PUBLISHABLE_KEY();

  const supabase = createClient(supabaseUrl, publishableKey);
  const { data: authData, error: authErr } = await supabase.auth.getUser(token);

  if (authErr || !authData?.user) {
    throw new Error(`Invalid session token: ${authErr?.message || "User not found"}`);
  }

  const userId = authData.user.id;

  // Query user_roles as the authenticated user
  const authedSupabase = createClient(supabaseUrl, publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: roleData, error: roleErr } = await authedSupabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "owner")
    .maybeSingle();

  if (roleData?.role === "owner") {
    ownerTokenCache.set(token, { userId, expiresAt: Date.now() + 5 * 60 * 1000 });
    return { userId };
  }

  // Fallback: check via has_role RPC if available
  const { data: hasRoleData } = await authedSupabase.rpc("has_role", {
    _role: "owner",
    _user_id: userId,
  });

  if (hasRoleData === true) {
    ownerTokenCache.set(token, { userId, expiresAt: Date.now() + 5 * 60 * 1000 });
    return { userId };
  }

  throw new Error(`Forbidden – not an owner`);
}

/**
 * Request handler for /api/b2-upload HTTP endpoint.
 */
export async function handleB2UploadRequest(request: Request): Promise<Response> {
  const jsonResponse = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  try {
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    let token = "";
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded")) {
      if (!token) {
        return jsonResponse({ error: "Missing or invalid Authorization header" }, 401);
      }
      return jsonResponse({ error: "Expected multipart/form-data body" }, 400);
    }

    const formData = await request.formData();

    if (!token) {
      token = (formData.get("authorization") as string) || "";
    }

    if (!token) {
      return jsonResponse({ error: "Missing or invalid Authorization header" }, 401);
    }

    // Run owner verification and upload‑URL fetch in parallel – they are independent
    const [_, uploadInfo] = await Promise.all([
      verifyOwner(token),
      getUploadUrl(),
    ]);
    // `uploadInfo` now holds a cached upload URL; if the cache is empty `getUploadUrl` will fetch it

    const file = (formData.get("file") || formData.get("image")) as File | null;
    if (!file) {
      return jsonResponse({ error: "No file provided" }, 400);
    }

    const mimeType = file.type || "image/webp";
    const allowedTypes = ["image/webp", "image/jpeg", "image/png", "image/avif", "image/svg+xml"];
    const isAllowed = allowedTypes.includes(mimeType) || /\.(webp|jpg|jpeg|png|avif|svg)$/i.test(file.name);
    if (!isAllowed) {
      return jsonResponse({ error: "Only image files (WebP, JPEG, PNG, AVIF) are allowed" }, 400);
    }

    const maxSizeBytes = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSizeBytes) {
      return jsonResponse({ error: "File size exceeds 3MB limit" }, 400);
    }

    const buffer = await file.arrayBuffer();
    const explicitKey = formData.get("key") as string | null;
    const prefix = (formData.get("prefix") as string) || "products/";
    const key = explicitKey || makeObjectKey(prefix, file.name || "image.webp");

    await uploadToB2(key, buffer, mimeType);
    const url = proxyUrl(key);

    return jsonResponse({
      success: true,
      url,
      key,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return jsonResponse({ error: error?.message || "Upload failed" }, 500);
  }
}

/**
 * Request handler for /api/b2-delete HTTP endpoint.
 */
export async function handleB2DeleteRequest(request: Request): Promise<Response> {
  const jsonResponse = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  try {
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    let token = "";
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    }

    let body: any = {};
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await request.json().catch(() => ({}));
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    if (!token && body.authorization) {
      token = body.authorization;
    }

    if (!token) {
      return jsonResponse({ error: "Missing or invalid Authorization header" }, 401);
    }

    try {
      await verifyOwner(token);
    } catch (err: any) {
      const msg = err?.message || "Forbidden – not an owner";
      const status = msg.includes("Invalid session token") ? 401 : 403;
      return jsonResponse({ error: msg }, status);
    }

    const rawKeys: string[] = [];
    if (body.key) rawKeys.push(body.key);
    if (Array.isArray(body.keys)) rawKeys.push(...body.keys);
    if (body.url) rawKeys.push(body.url);
    if (Array.isArray(body.urls)) rawKeys.push(...body.urls);

    const keysToDelete = rawKeys
      .map((k) => extractB2Key(k))
      .filter((k): k is string => Boolean(k));

    if (keysToDelete.length === 0) {
      return jsonResponse({ success: true, deleted: 0, message: "No B2 keys to delete" });
    }

    await Promise.allSettled(keysToDelete.map((k) => deleteFromB2(k)));

    return jsonResponse({
      success: true,
      deleted: keysToDelete.length,
      keys: keysToDelete,
    });
  } catch (error: any) {
    console.error("Delete handler error:", error);
    return jsonResponse({ error: error?.message || "Delete failed" }, 500);
  }
}