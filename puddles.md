## 浮点数精度问题

当我们在处理数据时，可能是没有意识到浮点数的陷阱，可能是怀着一种侥幸心理，导致浮点运算总会带给我们一些惊喜。最好的习惯是，无论什么时候，只要涉及运算处理，我们都要进行浮点精度处理，来保证运算的结果符合我们的期望(关于浮点运算的精度问题，[这里](https://github.com/camsong/blog/issues/9)有比较详细的介绍)。

#### 问题
```
0.1 + 0.2 === 0.3   // flase
1.005 * 100 === 1005    // false
```

#### 解决方案
方案一
```
const multi = Math.pow(10, 8)
(0.1 * multi + 0.2 * multi) === 0.3   // true
```
方案二
```
const strip = (num, precision = 12) => {
    return +parseFloat(num.toPrecision(precision)))
}
strip(1.005*100) === 1005   // true
```

## 时间处理问题

JS中，看似简单的Date对象，参数不一样、运算方式不一样、运行设备(安卓或IOS)不一样，返回的结果也很扑朔迷离(这里也推荐一篇[文章](http://chitanda.me/2015/08/21/the-trivia-of-js-date-function/)，推荐[一个工具](https://github.com/nefe/number-precision))。

1. 在ECMAScript5中，如果使用标准的日期时间字符串格式规则的字符串中，数字前有前置0，则会解析为UTC时间；时间没有前置0，则会解析为本地时间，其他情况一般都会解析为本地时间。因此开发时需要注意是否需要拼接0。
```
Date.parse('2019-5-5') === Date.parse('2019-05-05')    // false
```

2. 两个日期对象进行减法运算，返回的就是它们间隔的毫秒数；进行加法运算，返回的就是连接后的两个字符串
```
new Date('2019-11-05') - new Date('2019-11-04') // 86400000
new Date('2019-11-05') + new Date('2019-11-04') // "Tue Nov 05 2019 08:00:00 GMT+0800 (中国标准时间)Mon Nov 04 2019 08:00:00 GMT+0800 (中国标准时间)"
```

3. 表示时间字符串的分隔符不同，转换的时间也是不同的
```
new Date('2017-08-01').getTime() === new Date('2017/08/01').getTime()   // false
```

4. 由于Safari浏览器中对"2017-08-01"的解析不正确，会造成在ios系统中，new Date('2017-08-01 16:10:02').getTime()执行报错，解决办法：new Date('2017-08-01 16:10:02').replace(/\-/g,'/').getTime()

5. 个人理解，关于时间的处理，最好是由服务端进行，因为用户设备的系统时间是可以随便更改的，具有一定程度的不确定性。
