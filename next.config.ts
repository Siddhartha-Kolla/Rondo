import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repository-name>. The deploy workflow sets this;
// locally it stays empty, so `npm run dev` still runs at http://localhost:3000/.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // plain HTML/JS/CSS in ./out, no server needed
  basePath,
  images: { unoptimized: true }, // the image optimizer needs a server
};

export default nextConfig;
