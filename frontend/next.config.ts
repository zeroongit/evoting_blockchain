// next.config.js
module.exports = {
  experimental: {
    turbopack: {
      rules: {
        // Pindahkan aturan webpack kamu ke sini
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}