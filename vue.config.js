const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,

  // The previous build shipped a 1.0 MB `chunk-vendors.js.map` alongside a
  // 164 KB bundle: source maps were the largest artefact in `dist/`.
  productionSourceMap: false,

  devServer: {
    port: Number(process.env.PORT) || 8080,
    // Vue Router uses history mode, so deep links must fall back to index.html.
    historyApiFallback: true,
  },
});
