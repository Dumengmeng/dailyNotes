/**
 * Created by Judy on 2017/7/16.
 */
/*
* jQuery Source Code
*
*   1、简写版jQuery，使用自执行匿名函数，使得里边的变量属性为局部，避免与其他库冲突；
*   2、将里边的接口挂载到全局对象上，才能对外开放使用；
* */

(function (win, undefined) {
    //传入参数window：
    // 1、查找速度：window是最顶级的对象，查找起来会比较慢，根据就近原则，若传入window，则在使用的时候直接用这个参数window这个局部变量，而不是去查找最外层的全局变量window对象，提高了效率；
    //2、压缩：若不传入window,压缩的时候不会使用别名代替,若传入的话，则可以使用任何别名代替，这在压缩的时候很有用；

    //传入undefined
    //undefined 在某些浏览器里边是会被修改的，为防止个别情况下undefined被修改，因此若传入该参数，库里边有用到undefined的地方就是直接找到该参数，这样从而确保了undefined是未被修改过的（未被传入的参数，自然就是undefined），而不是去外边查找值不确定的undefined，但在新版本的浏览器中已经不能修改undefined值了；

    //1、定义变量和函数
    var jQuery = function() {};

    //2、往jQuery原型上添加方法
    jQuery.fn = jQuery.prototype = {};

    //3、jQuery的继承方法，后续添加的方法可以挂载到jQuery对象上，方方便后期的维护和扩展
    jQuery.extend = jQuery.fn.extend = function () {};

    //4、jQuery.extend() 扩展一些工具方法（静态属性和方法，也即最底层的内容）

    //5、Sizzle 复杂选择器的实现，是一个独立的方法库

    //6、Callbacks 回调对象 ， 函数逇统一管理

    //7、Deferred  延迟对象，对异步的统一管理

    //8、support  能力检测，主要是针对不同的浏览器的不同版本

    //9、data()  数据缓存

    //10、queue() 队列管理

    //11、attr() prop() val()... 对元素属性的操作

    //12、on() trigger() 事件操作的相关方法

    //13、DOM操作：添加、获取、删除...

    //14、css() 针对样式的操作

    //15、ajax()

    //16、animate()、show()、 hide()... 运动的方法

    //17、offset() 位置与尺寸的方法

    //18、jQuery支持模块化的方法
    if (typeof module === "object" && module && typeof module.exports === "object") {
        //common js 的规范
        module.exports = jQuery;
    } else {
        if (typeof define === "function" && defined.amd) {
            //amd的规范
            define("jquery", [], function() {return jQuery;});
        }
    }

    //最后一步、将jQuery函数挂载到全局对象上
    if (typeof win === "object" && typeof win.document === "object") {
        win.jQuery = win.$ = jQuery;
    }

})(window);
