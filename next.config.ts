import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Empty turbopack config to avoid conflicts
  turbopack: {},
  // Ensure WASM files are served correctly
  async headers() {
    return [
      {
        source: "/wasm/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/wasm",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  // Disable webpack processing for WASM files
  webpack: (config) => {
    config.resolve.extensions.push(".wasm");
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });
    return config;
  },
};

export default nextConfig;
