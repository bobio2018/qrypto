const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const autoprefixer = require('autoprefixer')

const styleLoaders = {
  fallback: {
    loader: require.resolve('style-loader'),
  },
  use: [
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 1,
        minimize: true,
      },
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebookincubator/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          autoprefixer({
            flexbox: 'no-2009',
          }),
        ],
      },
    },
  ],
}

module.exports = {
  entry: {
    background: ['./src/background/index.ts'],
    contentscript: ['./src/contentscript/index.ts'],
    inpage: ['./src/inpage/index.ts'],
    popup: ['./src/popup/index.tsx'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    // @see https://developer.chrome.com/extensions/manifest/web_accessible_resources
    publicPath : 'chrome-extension://__MSG_@@extension_id__/',
  },
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
    ],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loaders: require.resolve('tslint-loader'),
        enforce: 'pre',
        include: path.resolve(__dirname, './src'),
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.(ts|tsx)$/,
            include: path.resolve(__dirname, './src'),
            loader: require.resolve('ts-loader')
          },
          {
            exclude: /node_modules/,
            test: /\.css$/,
            loader: ExtractTextPlugin.extract(
              // use css-modules
              Object.assign({}, styleLoaders, {
                use: (() => {
                  const copiedUse = styleLoaders.use.slice()
                  // change css-loader options
                  const cssLoader = copiedUse[0]
                  copiedUse[0] = Object.assign({}, cssLoader, {
                    options: Object.assign({}, cssLoader.options, {
                      modules: true,
                    })
                  })
                  return copiedUse
                })()}
              )
            ),
          },
          {
            include: /node_modules/,
            test: /\.css$/,
            loader: ExtractTextPlugin.extract(styleLoaders),
          },
          {
            loader: require.resolve('file-loader'),
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/[name].[hash:8].[ext]',
            },
          },
        ],
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'all',
      chunks: ['background', 'contentscript', 'popup', 'inpage'],
      minChunks: 4,
      filename: 'commons.[name].js'
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'exclude-background',
      chunks: ['contentscript', 'popup', 'inpage'],
      minChunks: 3,
      filename: 'commons.[name].js'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'exclude-contentscript',
      chunks: ['background', 'popup', 'inpage'],
      minChunks: 3,
      filename: 'commons.[name].js'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'exclude-popup',
      chunks: ['background', 'contentscript', 'inpage'],
      minChunks: 3,
      filename: 'commons.[name].js'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'exclude-inpage',
      chunks: ['background', 'contentscript', 'popup'],
      minChunks: 3,
      filename: 'commons.[name].js'
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'background-contentscript',
      chunks: ['background', 'contentscript'],
      minChunks: 2,
      filename: 'commons.[name].js'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'background-popup',
      chunks: ['background', 'popup'],
      minChunks: 2,
      filename: 'commons.[name].js'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'background-inpage',
      chunks: ['background', 'inpage'],
      minChunks: 2,
      filename: 'commons.[name].js'
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'contentscript-popup',
      chunks: ['contentscript', 'popup'],
      minChunks: 2,
      filename: 'commons.[name].js'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'contentscript-inpage',
      chunks: ['contentscript', 'inpage'],
      minChunks: 2,
      filename: 'commons.[name].js'
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'popup-inpage',
      chunks: ['popup', 'inpage'],
      minChunks: 2,
      filename: 'commons.[name].js'
    }),

    new ExtractTextPlugin({
      filename: '[name].css',
    }),

    new CopyWebpackPlugin([
      { from: 'static' },
    ]),
  ]
}
