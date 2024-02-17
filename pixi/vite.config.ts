import { defineConfig } from "vite";

export default defineConfig({
    base: './',
    build: {
        target: "esnext",
        rollupOptions: {
            external: /\.skel$/,
            // output: {
            //     manualChunks: {
            //         pixi: ["pixi.js"],
            //     }
            // }
        },
    },
    server: {
        port: 3000,
        host: true,
    },
    preview: {
        host: true,
        port: 8080,
    },
});
