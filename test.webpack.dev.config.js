const path = require('path');

module.exports = {
    entry: './test/index.js',
    mode: 'development',
    node: { fs: 'empty' },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'webpack.dev.test.bundle.js',
    },
    devtool: 'source-map',
}
