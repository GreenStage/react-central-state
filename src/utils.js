export const haveCommon = function (a1, a2) {
    return a1.some(function (v) {
        return a2.indexOf(v) >= 0;
    });
};
