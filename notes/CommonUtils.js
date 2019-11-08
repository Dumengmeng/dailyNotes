const common = {

	/*
	* 判断是否为isNaN
	*/
	isNaN(item) {
		return item !== item;
	},

	isUndef(item) {
		return item === void 0;
	},

    addClass(dom, name) {
        if (dom.className && dom.className.indexOf(name) === -1) {
            dom.className === '' ? dom.className = name : dom.className += ' ' + name;
            dom.className += dom.className.length > 0 ? ' ' + name : name;
        }
        return;
    },

    removeClass(dom, name) {
        if (dom.className && dom.className.indexOf(name) > -1) {
            dom.className.indexOf(name) === 0 ? dom.className = dom.className.replace(name, '') : dom.className = dom.className.replace(' ' + name, '');
        }
        return;
    },

    /*
    * cookie工具:设置或获取cookie
    */
    cookie(key, val, opt = {}) {
        if (typeof val === 'undefined') {
            const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`);
            const arr = document.cookie.match(reg);
            if (arr) {
                return unescape(arr[2]);
            } else {
                return null;
            }
        } else {
            if (!val) {
                val = '';
                opt.expires = -356;
            } else {
                val = escape(val);
            }
            let date = new Date();
            date.setDate(date.getTime() + expires || 30 * 60 * 1000);
            val += '; expires=' + date.toGMTString();
            val += '; path=' + (opt.path || '/');
            val += '; domain=' + (opt.domain || '.lvmama.com');
            document.cookie = key + '=' + val;
        }
    },

    /*
    * 获取url的参数
    */
    getUrlPara(key, url = location.search) {
    	if (!this._isString(key)) return;

        let urlReg = new RegExp(`(?:&|\\?)${key}=(.*?)(?=&|$)`, 'g'),
            res = [],
            match;

        while (match = urlReg.exec(url)) {
            res.push(decodeURIComponent(match[1]));
        }
        
        return res.length > 1
            ? res
            : res[0];
    },

    /*
    * 获取对象的指定属性
    */
    getPathValue(object, path, defaultVal = '') {
        if ({}.toString.call(object) !== '')
        if (!this._isObject(object) || this.isEmpty(path)) return defaultVal;

        let pathArr = path.split(/\.|\[|\].?/),
            self = this;

        // 依次迭代获取对应的值，若中间出现undefined则返回默认值
        return pathArr.reduce((res, cur) => {
            if (!self.isUndef(res)) {
                return self.isEmptyStr(cur)
                    ? res
                    : self.isUndef(res[cur])
                        ? defaultVal
                        : res[cur];
            } else {
                return defaultVal;
            }
        }, object);
    },

    /*
    * promise封装的异步接口请求
    */
    request = function(method, url, async) {
        var async = async || 'true';
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, async);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    resolve(data);
                } else {
                    reject("接口调用异常：" + xhr.statusText);
                }
            };
            xhr.onerror = function() {
                reject("接口调用异常：" + xhr.statusText);
            }
            xhr.send(null);
        })
    }
}