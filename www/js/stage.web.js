/*
 * Stage.js 0.8.3
 * 
 * @copyright 2015 Ali Shakiba, Piqnt LLC
 * @license The MIT License
 */

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Stage=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var extend = require("./util/extend");

var is = require("./util/is");

var _config = {};

var _app_queue = [];

function Class(app) {
    _app_queue.push(app);
}

Class.config = function() {
    if (arguments.length === 1 && is.string(arguments[0])) {
        return _config[arguments[0]];
    } else if (arguments.length === 1 && is.object(arguments[0])) {
        extend(_config, arguments[0]);
    }
};

Class.app = function(app) {
    var loader = Class.config("app-loader");
    loader(app);
};

Class.start = function() {
    while (_app_queue.length) {
        var args = _app_queue.shift();
        Class.app(args);
    }
};

Class.config({
    "app-loader": function(app) {
        var canvas = null, context = null, full = true, width = 0, height = 0, ratio = 1;
        canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        var body = document.body;
        body.insertBefore(canvas, body.firstChild);
        context = canvas.getContext("2d");
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
        ratio = devicePixelRatio / backingStoreRatio;
        resize();
        window.addEventListener("resize", resize, false);
        window.addEventListener("orientationchange", resize, false);
        function resize() {
            if (full) {
                width = window.innerWidth > 0 ? window.innerWidth : screen.width;
                height = window.innerHeight > 0 ? window.innerHeight : screen.height;
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
            } else {
                width = canvas.clientWidth;
                height = canvas.clientHeight;
            }
            width *= ratio;
            height *= ratio;
            if (canvas.width === width && canvas.height === height) {
                return;
            }
            canvas.width = width;
            canvas.height = height;
        }
        app(canvas, context);
    }
});

window.addEventListener("load", function() {
    Class.start();
}, false);

module.exports = Class;
},{"./util/extend":2,"./util/is":3}],2:[function(require,module,exports){
module.exports = function(base) {
    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                base[key] = obj[key];
            }
        }
    }
    return base;
};


},{}],3:[function(require,module,exports){
var objProto = Object.prototype;

var owns = objProto.hasOwnProperty;

var toStr = objProto.toString;

var NON_HOST_TYPES = {
    "boolean": 1,
    number: 1,
    string: 1,
    undefined: 1
};

var hexRegex = /^[A-Fa-f0-9]+$/;

var is = module.exports = {};

is.a = is.an = is.type = function(value, type) {
    return typeof value === type;
};

is.defined = function(value) {
    return typeof value !== "undefined";
};

is.empty = function(value) {
    var type = toStr.call(value);
    var key;
    if ("[object Array]" === type || "[object Arguments]" === type || "[object String]" === type) {
        return value.length === 0;
    }
    if ("[object Object]" === type) {
        for (key in value) {
            if (owns.call(value, key)) {
                return false;
            }
        }
        return true;
    }
    return !value;
};

is.equal = function(value, other) {
    if (value === other) {
        return true;
    }
    var type = toStr.call(value);
    var key;
    if (type !== toStr.call(other)) {
        return false;
    }
    if ("[object Object]" === type) {
        for (key in value) {
            if (!is.equal(value[key], other[key]) || !(key in other)) {
                return false;
            }
        }
        for (key in other) {
            if (!is.equal(value[key], other[key]) || !(key in value)) {
                return false;
            }
        }
        return true;
    }
    if ("[object Array]" === type) {
        key = value.length;
        if (key !== other.length) {
            return false;
        }
        while (--key) {
            if (!is.equal(value[key], other[key])) {
                return false;
            }
        }
        return true;
    }
    if ("[object Function]" === type) {
        return value.prototype === other.prototype;
    }
    if ("[object Date]" === type) {
        return value.getTime() === other.getTime();
    }
    return false;
};

is.instance = function(value, constructor) {
    return value instanceof constructor;
};

is.nil = function(value) {
    return value === null;
};

is.undef = function(value) {
    return typeof value === "undefined";
};

is.array = function(value) {
    return "[object Array]" === toStr.call(value);
};

is.emptyarray = function(value) {
    return is.array(value) && value.length === 0;
};

is.arraylike = function(value) {
    return !!value && !is.boolean(value) && owns.call(value, "length") && isFinite(value.length) && is.number(value.length) && value.length >= 0;
};

is.boolean = function(value) {
    return "[object Boolean]" === toStr.call(value);
};

is.element = function(value) {
    return value !== undefined && typeof HTMLElement !== "undefined" && value instanceof HTMLElement && value.nodeType === 1;
};

is.fn = function(value) {
    return "[object Function]" === toStr.call(value);
};

is.number = function(value) {
    return "[object Number]" === toStr.call(value);
};

is.nan = function(value) {
    return !is.number(value) || value !== value;
};

is.object = function(value) {
    return "[object Object]" === toStr.call(value);
};

is.hash = function(value) {
    return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

is.regexp = function(value) {
    return "[object RegExp]" === toStr.call(value);
};

is.string = function(value) {
    return "[object String]" === toStr.call(value);
};

is.hex = function(value) {
    return is.string(value) && (!value.length || hexRegex.test(value));
};


},{}]},{},[1])(1)
});