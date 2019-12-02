var bundleFn = arguments[3];

const extractWebpack = require('./extract-webpack-module');

module.exports = function (
  modulePathOrId,
  requiredFunction,
) {
    return new Promise((resolve, reject) => {

        if (typeof __webpack_modules__ !== 'undefined') {
            // We're running in a webpack'd bundle
            const src = extractWebpack(modulePathOrId);
            return resolve(src);
        }

        if (typeof bundleFn === 'function') {
            // We're running in a browserify'd bundle
            return resolve(require('./extract-browserify-module')(requiredFunction));
        }

        if (typeof bundleFn === 'string') {
            // We're running in node, without having been bundled by browserify
            try {
                const b = require('browserify')(modulePathOrId).bundle();
                b.on('error', reject);
                let str = '';
                b.on('data', (data) => { str += data.toString(); });
                b.on('end', () => { resolve(str); });
                return;
            } catch (e) {
                reject(new Error('Could not bundle module, browserify not available.'));
                return;
            }       
        }

        reject(new Error('Could not bundle module, unable to identify environment.'))
    });
}
