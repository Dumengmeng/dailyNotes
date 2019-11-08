/*
** callbacks 中容易忽略的点
*/
var index = 0;
var addOne = function(num) {
	num++;
	index++;
	if (num < 5) {
		addOne(num);
		console.log("num:" + num + "  index:" + index);
	}
}
addOne(0);

//output:
// num:4  index:5
// num:3  index:5
// num:2  index:5
// num:1  index:5

/*
*	notes:
*	回调使得函数的处理更有连贯性，对于处理一些连续一致性的事件以及异步请求具有得天独厚的优势，但是，对其的使用也要异常的小心，尤其是回调函数内部的任意一条语句的处理，任意一条语句的执行顺序的颠倒都会产生天差地别的结果，正如上述例子中的情况。
*	
*/