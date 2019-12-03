// Copied from npm module 'webworkify' https://github.com/browserify/webworkify/
// Modified to avoid creating its own main module, this may void babel es module export support
// Modified to return the source and id of the requested module instead of `Blob`ing it and putting in a web worker
// Modified to figure out a good value for globalThis instead of using `self`, which would only be appropriate in a worker
// Copied from git commit baf2884256768aea6c36be1ea6e1efb2144fcfbc

var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

const getGlobalThis = require('./global-this').ternary;

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            'function(require,module,exports){' + fn + '(' + getGlobalThis + '); }',
            wcache
        ];
    }
    var workerSources = {};
    resolveSources(wkey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(wkey) + '])'
    ;

    return { main: wkey, source: src };
};
