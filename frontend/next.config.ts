import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empacota só o necessário para rodar em container.
  output: "standalone",
};

export default nextConfig;
