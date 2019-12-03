Point it to a module, and it'll return a string of the bundled source for that module and its dependencies. Evaluating that string with `new Function` (NOT `eval`) will give you the exports of your module.

* Works in bundles bundled with browserify.
* Works in bundles bundled with webpack.
* Works in node without having used a bundler IFF you have browserify installed and available in node_modules, and your module can be browserified with the `node` and `fullPaths` options.

Does all these things simultaneously if you follow the calling convention below.

# Usage

```js
const bundledSource = require('bundled-source');

const srcPromise = bundledSource(
    require.resolve && require.resolve('./some-module'), // used in node and in webpack'd bundle
    require('./some-module'),         // used in browserified bundle
);

// in non-bundled node, we call out to browserify, so need to be async.
const src = await srcPromise;

// ELSEWHERE, maybe in an isolated-vm or webworker
// you can do this to get the exports of `some-module`:

const f = new Function(src);
const exports = f();
```

See `test/index.js` to see it used for real.

# Why?

Useful for taking module source and shoving it in a webworker, isolate-vm, or other separated environment, if your code is bundled with different bundlers depending on the environment it runs in. For this reason, we ensure the API is one that can be handled by all of these environments and bundlers without any changes.

You probably want to use `webworkify` or `webworkify-webpack` if you're only bundling and running in one environment.

# Compatibility

Tested with:
* webpack 4.41.2
* browserify 16.5.0
* node 8.15.0

* NOT tested with webpack configurations that use more than one chunk.
* Probably NOT compatible with babel's es modules.

# Warnings

As you see above, we are forced to call `require('./some-module')` in the environment where we do the bundling. Would have been nice to avoid, but since we are using `webworkify`'s code for it, unavoidable. Be aware of this and architect your `some-module` so that it doesn't have any side unwanted effects when you `require` it.

We're using code copied from `webworkify` and `webworkify-webpack`. These would take and modify `self` which is the top level global inside webworkers. To facilitate running the bundled code in different environments, `self` has been changed to be whichever is available: `self`, `window`, or `global`, in that order. So be aware that one of these must be available in the environment where you eval the resulting bundled source, and that it will be messed with.

# Developing

Not really looking to change this much after publication. If you have a way to get rid of the code from `webworkify-webpack`, that'd be nice. Feels like that stuff should happen at build time, not at runtime. A test to make sure the function exported from the bundled module is somehow accessible would also be nice. Not sure if that's easy to do in a way that works with both browserify and webpack's modulization.

# Testing

Do all this in sequence:

* `yarn`
* `yarn build-tests`
* `yarn test-node` - should run the test in four environments, which must succeed

Three in-browser tests. Running each of these commands will expose a page on `localhost:8080` or such. Visit and ensure the background turns green. I've found that even with Chrome dev tools set to skip cache, I had to restart Chrome to avoid this stuff being cached.

* `yarn test-browserify-browser`
* `yarn test-webpack-prod-browser`
* `yarn test-webpack-dev-browser`

We need to test with webpack bundled with both production and development mode because `require.resolve` returns paths and integers in them, respectively.

# ヽ(´ー｀)ノ

Special thanks to everything for being a mess.
