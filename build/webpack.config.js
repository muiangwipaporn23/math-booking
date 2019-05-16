const AntdScssThemePlugin = require('antd-scss-theme-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  entry: '../src/index.js',
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'bundle.js',
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src'),
    ],
    extensions: ['.json', '.js', '.jsx', '.css', '.less'],
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
            loader: '../sassVarsToLess.js',
          },
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/, /\.ttf$/],
        loader: require.resolve('url-loader'),
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['../dist'], { root: process.cwd() }),
    new HtmlWebpackPlugin({
      inject: true,
      template: "../public/index.html",
      filename: "./index.html",
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
    }),
    new AntdScssThemePlugin(
      path.join(__dirname, '../src/variables.scss'
    )),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    new UglifyJsPlugin({
      sourceMap: true,
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../src/font/sukhumvitset-text-webfont.ttf'),
        to: path.join(__dirname, '../dist/font/sukhumvitset-text-webfont.ttf'),
      },
      {
        from: path.join(__dirname, '../public/favicon.png'),
        to: path.join(__dirname, '../dist/favicon.png'),
      },
    ]),
  ],
  context: __dirname,
  target: 'web',
}