module.exports = {
    globalThis: function () {
        if (typeof self !== 'undefined') { return self; }
        if (typeof window !== 'undefined') { return window; }
        return global;
    },
    ternary: '( (typeof self !== "undefined") ? self : (typeof window !== "undefined") ? window : global )',
};
