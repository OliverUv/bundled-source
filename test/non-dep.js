// should never be bundled or required

console.log('__BADEVIL__');

throw new Error('__BADEVIL__');

module.exports = function badevil(arg) {
    return null;
}
