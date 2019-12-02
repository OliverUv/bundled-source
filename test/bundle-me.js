const two = require('./bundle-dep');

console.log('__BUNDLE_ME__');

const g = typeof window !== 'undefined' ? window : global;
g.__EVAL_CHECK__ = two(true);

module.exports = function one(arg) {
    return two(arg);
}
