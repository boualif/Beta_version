const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// HTML inclusion pattern for nested HTML processing
const INCLUDE_PATTERN = /<include src="(.+)"\s*\/?>(?:<\/include>)?/gi;
const processNestedHtml = (content, loaderContext, dir = null) =>
  !INCLUDE_PATTERN.test(content)
    ? content
    : content.replace(INCLUDE_PATTERN, (m, src) => {
        const filePath = path.resolve(dir || loaderContext.context, src);
        loaderContext.dependency(filePath);
        return processNestedHtml(
          loaderContext.fs.readFileSync(filePath, 'utf8'),
          loaderContext,
          path.dirname(filePath)
        );
      });

// HTML generation - find all HTML files in src directory
const paths = [];
const generateHTMLPlugins = () =>
  glob.sync('./src/*.html').map((dir) => {
    const filename = path.basename(dir);

    if (filename !== '404.html') {
      paths.push(filename);
    }

    return new HtmlWebpackPlugin({
      filename,
      template: `./src/${filename}`,
      favicon: `./src/images/favicon.ico`,
      inject: 'body',
    });
  });

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/js/index.js', // Make sure this path exists
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    assetModuleFilename: '[path][name][ext]',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    host: '0.0.0.0', // Allow connections from outside
    historyApiFallback: true,
    
    // Fix for Invalid Host header issue
    allowedHosts: 'all',
    
    // Set headers for CORS
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    
    // Completely disable host checking
    client: {
      webSocketURL: {
        hostname: '0.0.0.0',
        pathname: '/ws',
        password: '',
        port: 443,
        protocol: 'ws',
      },
      progress: true,
    },
    
    // Handle websocket connections
    webSocketServer: false
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                'prismjs',
                {
                  languages: ['javascript', 'css', 'markup'],
                  plugins: ['copy-to-clipboard'],
                  css: true,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: ['last 2 versions'],
                  }),
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          preprocessor: processNestedHtml,
        },
      },
    ],
  },
  plugins: [
    // If generateHTMLPlugins function doesn't find any files, use a default HtmlWebpackPlugin
    ...(glob.sync('./src/*.html').length > 0 
      ? generateHTMLPlugins() 
      : [
          new HtmlWebpackPlugin({
            template: './src/index.html',
            favicon: './src/images/favicon.ico',
            inject: 'body',
          })
        ]
    ),
    new MiniCssExtractPlugin({
      filename: 'style.css',
      chunkFilename: 'style.css',
    }),
  ],
  target: 'web', // fix for "browserslist" error message
  stats: 'errors-only', // suppress irrelevant log messages
};