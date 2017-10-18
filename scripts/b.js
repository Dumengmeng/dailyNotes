/**
 * Created by Adminstor on 2017/8/3.
 */

define("b", ["require", "exports", "a"], function(require, exports, a) {
    exports.getMaxInfo = function(num1, num2) {
        var res = a.getMax(num1, num2);
        console.log("b's output is : ", res);
    };
});
