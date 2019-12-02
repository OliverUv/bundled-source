const path = require('path');

module.exports = {
    entry: './test/index.js',
    mode: 'production',
    node: { fs: 'empty' },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'webpack.prod.test.bundle.js',
    },
    // devtool: 'source-map',
}
