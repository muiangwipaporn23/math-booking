const AntdScssThemePlugin = require('antd-scss-theme-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  mode: 'development',
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, '../src/index.js'),
  ],
  output: {
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src'),
    ],
    extensions: ['.json', '.js', '.jsx', '.css', '.less', '.mjs'],
    alias: {
      components: path.resolve(__dirname, '../src/components'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
        ],
      },
      {
        test: /\.less$/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            AntdScssThemePlugin.themify({
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
              },
            }),
          ],
      },
      {
        test: /\.scss$/,
          issuer: {
            exclude: /\.less$/,
          },
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            AntdScssThemePlugin.themify('sass-loader'),
          ],
      },
      {
        test: /\.scss$/,
        issuer: /\.less$/,
          use: {
            loader: './sassVarsToLess.js',
          },
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/, /\.ttf$/],
        loader: require.resolve('url-loader'),
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "../public/index.html",
      filename: "./index.html",
    }),
    new AntdScssThemePlugin(
      path.join(__dirname, '../src/variables.scss'
    )),
    new webpack.DefinePlugin({
      'process.env': {
        GATEWAY_URL: `'${process.env.GATEWAY_URL}'`,
        LANGUAGES: `'${process.env.LANGUAGES}'`,
      },
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../public/font/sukhumvitset-text-webfont.ttf'),
        to: path.join(__dirname, '../dist/font/sukhumvitset-text-webfont.ttf'),
      },
      {
        from: path.join(__dirname, '../public/favicon.png'),
        to: path.join(__dirname, '../dist/favicon.png'),
      },
    ]),
  ],
  devtool: 'source-map',
  context: __dirname,
  target: 'web',
  devServer: {
    contentBase: path.join(__dirname, "../dist/"),
    host: 'localhost',
    port: 5011,
    historyApiFallback: true,
  },
}
