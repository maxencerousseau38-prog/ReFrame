/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Playwright ships its own browser binaries and must not be bundled by the
  // server compiler; keep it external so the local headless fallback can load.
  // Playwright ships browser binaries; sharp ships native bindings — neither
  // must be bundled by the server compiler. Keep them external.
  serverExternalPackages: ["playwright", "sharp"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
