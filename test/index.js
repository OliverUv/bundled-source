const tape = require('tape');
const browserTap = require('tap-browser-color');

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    // Allows us to run the test in a browser and see the output nicely
    browserTap();
}

const getGlobalThis = require('../src/global-this').globalThis;
const bundledSource = require('../src');

tape('test', async function (t) {
    const src = await bundledSource(
        require.resolve && require.resolve('./bundle-me.js'),
        require('./bundle-me.js'),
    );
    t.ok(src.includes('__BUNDLE_ME__'), 'has module');
    t.ok(src.includes('__BUNDLE_DEP__'), 'has module dependency');
    t.notOk(src.includes('__BADEVIL__'), 'does not have unrequired module');
    t.notOk(src.includes('badevil'), 'does not have unrequired module');

    const g = getGlobalThis();
    g.__EVAL_CHECK__ = false;
    const f = eval(src);
    t.ok(g.__EVAL_CHECK__, 'can eval module');

    t.end();
});
