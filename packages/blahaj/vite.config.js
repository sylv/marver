import react from '@vitejs/plugin-react';
import ssr from 'vike/plugin';
import { defineConfig } from 'vite';
import { cjsInterop } from 'vite-plugin-cjs-interop';
import codegen from 'vite-plugin-graphql-codegen';
export default defineConfig({
    plugins: [
        react(),
        ssr(),
        codegen({
            configFilePathOverride: '.graphqlrc',
        }),
        cjsInterop({
            dependencies: ['@privjs/gradients'],
        }),
    ],
    resolve: {
        alias: {
            '#root': '/src',
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    ssr: {
        noExternal: ['react-helmet-async'],
    },
});
