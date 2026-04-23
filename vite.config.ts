import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// [중략: 기존 Manus 로그 수집 관련 함수들은 그대로 두셔도 무방합니다]

export default defineConfig(({ command }) => {
  const isProd = command === 'build';

  return {
    // 1. 배포 경로 확정
    base: isProd ? '/excellent-companies-portal/' : '/',
    
    plugins: [
      react(),
      tailwindcss(),
      jsxLocPlugin(),
      vitePluginManusRuntime(),
      // 개발 환경에서만 로그 수집기 활성화
      !isProd && vitePluginManusDebugCollector(), 
    ].filter(Boolean) as Plugin[],

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },

    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),

    build: {
      // 2. GitHub Pages는 dist 폴더를 기본으로 인식합니다.
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          // 에셋 경로 충돌 방지
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },

    // 개발 서버 설정 (배포 시에는 영향 없음)
    server: {
      port: 3000,
      host: true,
      allowedHosts: ["localhost", "127.0.0.1", ".manus.computer"],
    },
  };
});
