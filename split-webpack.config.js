const path = require('path')
const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { version } = require('./package.json');
const platforms = [
  "chrome",
  "firefox"
];
const distFolder = path.resolve(__dirname, 'dist')



const config = [
  {
    name: "chrome",
    mode: process.env.NODE_ENV,
    context: __dirname + '/src',
    entry: {
      ...getPlatformFiles('chrome')
    },
    node: {
      fs: 'empty', net: 'empty', tls: 'empty'
    },
    output: {
      path: __dirname + '/dist/chrome',
      filename: '[name].js',
    },
    optimization: {
      splitChunks: {
        // include all types of chunks
        chunks: 'all'
      }
    },
    resolve: {
      extensions: ['.js', '.vue'],
    },
    module: {
      rules: [
        ...getRules()
      ],
    },
    plugins: [
      ...getPlugins('chrome')
    ],
  },
  {
    name: "firefox",
    mode: process.env.NODE_ENV,
    context: __dirname + '/src',
    entry: {
      ...getPlatformFiles('firefox')
    
    },
    node: {
      fs: 'empty', net: 'empty', tls: 'empty'
    },
    output: {
      path: __dirname + '/dist/firefox',
      filename: '[name].js',
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    resolve: {
      extensions: ['.js', '.vue'],
    },
    module: {
      rules: [
        ...getRules()
      ],
    },
    plugins: [
      ...getPlugins('firefox')
    ],
  }
  
]

config.forEach((c) => {
  if (c.mode === 'production') {
    c.plugins = (c.plugins || []).concat([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
        },
      }),
    ]);
  }

  
})

if (process.env.HMR === 'true') {
  config[0].plugins = (config[0].plugins || []).concat([
    new ChromeExtensionReloader({
      port: 9099
    }),
  ]);
}



function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}

function getPlatformFiles(platform) {
  let files = {}
  let pl = platforms.map((platform) => {
    
  })

  pl.forEach(p => {
    files =  {
      ...files,
      ...p
    }
  })
  return {
    [`background`]: './background.js',
    [`inject`]: './inject.js',
    [`popup/popup`]: './popup/popup.js',
    [`options/options`]: './options/options.js',
    [`main`]:'./main.js',
    [`phishing/phishing`]:'./phishing/phishing.js',
    [`aepp`]:'./aepp.js',
    [`popup/cameraPermission`]:'./popup/cameraPermission.js'
  }
}

function getPlugins(platform) {
  return [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['dist']
    }),
    new webpack.DefinePlugin({
      global: 'window',
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
      ignoreOrder: false,
    }),
    new CopyWebpackPlugin([
      { from: 'icons', to: `icons`, ignore: ['icon.xcf'] },
      // { from: 'popup/popup.html', to: `popup/popup.html`, transform: transformHtml },
      { from: 'options/options.html', to: `options/options.html`, transform: transformHtml },
      { from: 'phishing/phishing.html', to: `phishing/phishing.html`, transform:transformHtml },
      { from: 'popup/CameraRequestPermission.html', to: `popup/CameraRequestPermission.html`, transform:transformHtml },
      { from: 'icons/icon_48.png', to: `popup/assets/logo-small.png` },
      {
        from: `manifests/manifest_${platform}.json`,
        to: `manifest.json`,
        transform: content => {
          const jsonContent = JSON.parse(content);
          jsonContent.version = version;

          if (config.mode === 'development') {
            jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
          }

          return JSON.stringify(jsonContent, null, 2);
        },
      },
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup", "popup.html"),
      filename: "popup/popup.html",
      chunks: ["popup/popup"]
    }),
  ]
}

function getRules() {
  return [
    {
      test: /\.vue$/,
      loaders: 'vue-loader',
    },
    {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    },
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader'],
    },
    {
      test: /\.scss$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
    },
    {
      test: /\.sass$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
    },
    {
      test: /\.(png|jpg|gif|svg|ico)$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]?emitFile=false',
      },
    },
  ]
}

module.exports = config;
