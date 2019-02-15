const ThreeWebpackPlugin = require('@wildpeaks/three-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.js',
  },
  output: {
    filename: '[name].[hash:8].js',
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
      {
        test: /\.(png|svg|jpg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[md5:hash:hex:8].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(obj)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[md5:hash:hex:8].obj.txt',
            },
          },
        ],
      },
    ],
  },
  devtool: 'source-map',
  plugins: [
    new ThreeWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ],
}
