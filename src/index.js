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
            const wrap = `return ${src};`;
            return resolve(wrap);
        }

        if (typeof bundleFn === 'function') {
            // We're running in a browserify'd bundle
            const extractBrowserify = require('./extract-browserify-module');
            const res = extractBrowserify(requiredFunction);
            const mainModuleId = JSON.stringify(res.main);
            const bundleSource = res.source;
            const wrap = `return (function(){return ${bundleSource}(${mainModuleId});})();`;
            return resolve(wrap);
        }

        if (typeof bundleFn === 'string') {
            // We're running in node, without having been bundled by browserify
            try {
                const b = require('browserify')(
                    modulePathOrId,
                    {
                        node: true,
                        fullPaths: true,
                    },
                ).bundle();
                b.on('error', reject);
                let str = '';
                b.on('data', (data) => { str += data.toString(); });
                b.on('end', () => {
                    const inner = `(function() {return ${str}})()`;
                    const wrap = `return (function(){return ${inner}('${modulePathOrId}');})();`;
                    resolve(wrap);
                });
                return;
            } catch (e) {
                reject(new Error('Could not bundle module, browserify not available.'));
                return;
            }       
        }

        reject(new Error('Could not bundle module, unable to identify environment.'))
    });
}
