import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  const IS_PROD = !options.watch
  return {
    entry: ['src/index.ts'],
    splitting: false,
    sourcemap: !IS_PROD,
    clean: true,
    format: ['cjs', 'esm'],
    dts: IS_PROD,
    minify: IS_PROD,
    onSuccess: 'node dist/index.js',
  }
})
