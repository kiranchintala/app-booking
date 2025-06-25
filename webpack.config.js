const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/main.jsx',
  mode: 'development',
  target: 'web',
  devServer: {
    port: 3002,
    historyApiFallback: true
  },
  output: {
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@mtbs/shared-lib/auth': process.env.MOCK_AUTH === 'true'
        ? path.resolve(__dirname, 'src/auth.mock.js')
        : path.resolve(__dirname, 'src/auth.js'),
    },
  },
  module: {
    rules: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'booking',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.20.0' },
        '@mtbs/shared-lib': {
          singleton: true,
          requiredVersion: '^1.0.0'
        }
      }
    }),
    new Dotenv(),
    new HtmlWebpackPlugin({ template: './index.html' })
  ],
  ignoreWarnings: [
    {
      module: /@mtbs\/shared-lib\/dist\/mocks\.js/,
      message: /Critical dependency: require function/
    }
  ]
};