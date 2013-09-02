(function(window, document, $, undefined) {
    'use strict';

    var _$ = $;

    $ = window.$ = function (str, context) {
        return document.querySelector(str);
    };

    $.noop = function() {};

    $.merge = function(target) {
        var objs = [].slice.call(arguments, 1);
        target || (target = {});
        for (var i = 0, len = objs.length, tmp; i < len; i++) {
            tmp = objs[i];
            if (tmp == Object(tmp)) {
                for (var key in tmp) {
                    if (tmp.hasOwnProperty(key)) {
                        target[key] = tmp[key];
                    }
                }
            }
        }
        return target;
    };

    $.isObject = function(obj) {
        return obj === Object(obj);
    };

    $.isArrayLike = function(ary) {
        if (ary.length == (+ary.length)) {
            return true;
        }
        return false;
    };

    $.each = function(arrayLike, func, context) {
        if (Array.isArray(arrayLike)) {
            arrayLike.forEach(func, context);
        } else if ($.isArrayLike(arrayLike)) {
            Array.prototype.forEach.call(arrayLike, func, context);
        } else if ($.isObject(arrayLike)) {
            for (var key in arrayLike) {
                if (arrayLike.hasOwnProperty(key)) {
                    func.call(context, arrayLike[key], key, arrayLike);
                }
            }
        } else if (typeof arrayLike == 'string') { // 处理字符串...

        }
    };

    $.access = function(obj, key, setVal, getVal, val) {
        if ($.isObject(key)) { // 以对象形式的设置值
            for (var i in key) {
                $.access(obj, i, setVal, getVal, key[i]);
            }
        }
        if (val) { // 设置值
            setVal(obj, key, val);
        } else { // 取值
            return getVal(obj, key);
        }
    };

    $.uniqueId = function() {
        var uuid = 1;
        return function(obj) {
            return obj['$uuid'] || (obj['$uuid'] = uuid++);
        };
    }();

    $.data = function() {
        var dataObj = {};
        return function(obj, key, val) {
            var uuid = $.uniqueId(obj);
            var cache = obj.nodeType ? (dataObj['$data' + uuid] || (dataObj['$data' + uuid] = {}))
                                     : obj;
            return $.access(cache, key, function(obj, key, val) {
                obj[key] = val;
            }, function(obj, key) {
                return obj[key];
            }, val);
        }
    }();

    $.on = function(elem, eventName, func) {
        elem.addEventListener(eventName, func, false)
    };

    $.off = function(elem, eventName, func) {
        elem.removeEventListener(eventName, func, false)
    };

    // 某个元素是否匹配选择器selector
    $.matchesSelector = function(elem, selector) {
        if (!elem || elem.nodeType !== 1) return false;
        return (elem.matchesSelector ||
                elem.webkitMatchesSelector ||
                elem.mozMatchesSelector ||
                elem.oMatchesSelector ||
                elem.msMatchesSelector).call(elem, selector);
    };

    // 查找距离ele最近的符合selector的元素
    $.closest = function(ele, selector) {
        if (!selector) return ele;
        if (ele.nodeType) {
            if ($.matchesSelector(ele, selector)) {
                return ele;
            } else if (ele.parentNode) {
                return $.closest(ele.parentNode, selector);
            } else {
                return null;
            }
        } else {
            if (ele.parentNode) {
                return $.closest(ele.parentNode, selector);
            } else {
                return null;
            }
        }
    };

    // 函数节流 包装器
    $.throttle = function(func, time, context) {
        var lastTimeout;
        context || (context = null);
        return function() {
            if (lastTimeout) clearTimeout(lastTimeout);
            var args = arguments;
            lastTimeout = setTimeout(function() {
                func.apply(context, args);
            }, time || 0);
        };
    };

    // 函数柯里化
    // eg:
    // var a = $.curry(function() {
    // 
    // });
    // a(10)
    $.curry = function(func) {
        var _args = [];
        return function curryFn() {
            //  直至函数的参数只有一个的时候才产生结果
            if (arguments.length === 0) {
                return func.apply(this, _args);
            }
            _args.push.apply(_args, arguments);
            return curryFn; // 这里避免使用arguments.callee
        };
    };

    // 函数的反柯里化
    // 1):
    // eg:
    // var obj = [];
    // var push = [].push.uncurrying;
    // push(obj, '123'); // 相当于[].push.call(obj, '123')
    // Function.prototype.uncurrying = function() {
    //     var _this = this; // 函数本身
    //     return function() {
    //         return Function.prototype.call.apply(_this, arguments);
    //     }
    // }
    //
    // 2):
    // eg:
    // var obj = [];
    // var push = $.uncurrying([].push);
    // push(obj, '111')
    $.uncurrying = function(func) {
        return function() {
            return Function.prototype.call.apply(func, arguments);
        };
    };

 })(window, document, window.$);