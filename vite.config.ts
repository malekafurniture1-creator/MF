// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function b2UploadDevPlugin(): Plugin {
  return {
    name: "b2-upload-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
        if (parsedUrl.pathname === "/api/b2-upload") {
          try {
            const protocol = req.headers["x-forwarded-proto"] || "http";
            const fullUrl = `${protocol}://${req.headers.host}${req.url}`;

            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const bodyBuffer = Buffer.concat(chunks);

            const headers = new Headers();
            for (const [k, v] of Object.entries(req.headers)) {
              if (v) {
                if (Array.isArray(v)) {
                  v.forEach((val) => headers.append(k, val));
                } else {
                  headers.set(k, v);
                }
              }
            }

            const standardRequest = new Request(fullUrl, {
              method: req.method,
              headers,
              body: req.method !== "GET" && req.method !== "HEAD" ? bodyBuffer : undefined,
              // @ts-ignore
              duplex: "half",
            });

            const { handleB2UploadRequest } = await import("./src/lib/b2.ts");
            const response = await handleB2UploadRequest(standardRequest);

            res.statusCode = response.status;
            response.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });
            const resBuffer = await response.arrayBuffer();
            res.end(Buffer.from(resBuffer));
          } catch (err: any) {
            console.error("Dev upload middleware error:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err?.message || "Internal server error" }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [b2UploadDevPlugin()],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
