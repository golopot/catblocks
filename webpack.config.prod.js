const ThreeWebpackPlugin = require('@wildpeaks/three-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    main: './src/main.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: `${__dirname}/dist`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['env'],
          plugins: [
            ['transform-class-properties'],
            ['transform-object-rest-spread'],
          ],
        },
      },
    ],
  },
  plugins: [
    new ThreeWebpackPlugin(),
  ],
}
