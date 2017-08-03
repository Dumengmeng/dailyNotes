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

    // "use strict";
    // 需明确严格模式和非严格模式的具体区别，以及在各个场合如何去解析模式
    //1、不使用var去声明变量会报错；
    //2、arguments.callee在严格模式下不能使用；
    //3、初始化一个变量为八进制形式会报错；
    //TODO

    //判断某值是否为undefined，不要简单的 val == undefined,这样可能会存在一些判断不了的情况，建议使用 typeof val == "undefined"

    //1、定义变量和函数  ,  这样存储，有利于压缩
    //同时 原型链上的方法注意变量保存，避免开销
    var jQuery = function() {},
        location = window.location,
        docElement = document.documentElement,
    //预防冲突
        _jQuery = window.jQuery,
        _$ = window.$;

    //2、往jQuery原型上添加方法
    jQuery.fn = jQuery.prototype = {};

    // init() 方法，使用标签 id 类名等创建或获取标签；
    //$.merge()
    //$(document).find()
    // $(function(){})  ==> $(document).ready(function(){})
    //$.makeArray() ==> 将类数组转换为数组
    //$("div").get() 转原声集合


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


    /*
     * summary
     *
     * */

    /*
    * jQuery基本面向对象
    * */
    function jQquery() {
        return new jQuery.prototype.init();
    }
    jQuery.prototype.init = function () {
    };
    jQuery.prototype.fun = function () {
    };
    jQuery().fun();


    /*
     * jQuery hook:
     * 钩子也即方法，使用钩子将所有 触发条件一致 的 事件 绑定到同一战线上，达到“同生共死”；
     * 钩子的没有统一的模式定义，在我看来，它只是一种对于JS代码解耦写法的方式的一种形象比喻；
     * jQuery里用到hook的方法 ：
     *  .attr(), .prop(), .val() ，.css()
     * https://blog.rodneyrehm.de/archives/11-jQuery-Hooks.html
     *
     * 下例实现了一个方法，可以添加自定义的钩子，并执行挂载在该钩子上的方法
     * */
    var Hook = function() {
        //声明一个存放钩子的数组
        this.queue = {};
    };

    //添加钩子
    Hook.prototype.addAction = function(hook, fun1) {
        var that = this;
        //若该hook不存在对应的数组 则创建存放对应该钩子下的函数的数组
        !that.queue[hook] && (that.queue[hook] = []);

        if (typeof fun1 === "function") {
            //存放类型为函数
            that.queue[hook].push(fun1);
        } else if (typeof fun1 === "string") {
            //存放类型为字符串
            window[fun1] && that.queue[hook].push(window[fun1]);
        } else if ({}.toString.call(fun1) === "[object Array]") {
            //存放类型为数组
            fun1.forEach(function(item) {
                if (typeof item === "function") {
                    that.queue[hook].push(item);
                } else if (typeof item === "string") {
                    window[item] && that.queue[hook].push(window[item]);
                }
            })
        }
    };

    //执行函数栈
    Hook.prototype.call_fun = function(hookName, paramObj) {
        var func = hookName;
        //若最终的对象不是函数
        if (typeof func !== "function") {
            throw new Error(hookName + " isn't a function");
        }
        //参数对象为空
        if (typeof paramObj === "undefined") {
            func.apply();
        } else {
            console.log(paramObj)
            func.apply(null, paramObj)
        }
    };

    //执行钩子
    Hook.prototype.doAction = function(hook, param) {
        //获取第一个参数之后的参数
        var that = this;
        var paramObj = (param && Object.getOwnPropertyNames(param).length > 0) ? param : undefined;
        var funs = that.queue[hook];
        if (Array.isArray(funs) && funs.length > 0) {
            funs.forEach(function (item) {
                //函数栈里每一个函数的名字, 参数可能为空
                that.call_fun(item, paramObj[item.name]);
            })
        }
    };

    var fun1 = function(num) {console.log("fun1 for hook  ------",  num)};
    var fun2 = function() {console.log("fun2 for hook")};
    var fun3 = function(name, age) {console.log("fun3 for hook  name : " + name + " age : " + age )};
    var fun4 = function() {console.log("fun4 for hook")};
    //参数的格式为数组对象
    var paramObj = {
        fun1 : [
            123
        ],
        fun3 : [
            "Lily",
            30
        ]
    }
    var hook = new Hook();
    hook.addAction("hook1", fun1);
    hook.addAction("hook1", "fun2");
    hook.addAction("hook1", [fun3, fun4]);
    hook.doAction("hook1", paramObj);



})(window);
























