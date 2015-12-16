var extend = require('./util/extend');
var is = require('./util/is');

var _loaded = false;
var _config = {};
var _app_queue = [];

function Class(app) {
    return Class.app(app);
}

Class.config = function () {
    if (arguments.length === 1 && is.string(arguments[0])) {
        return _config[arguments[0]];
    } else if (arguments.length === 1 && is.object(arguments[0])) {
        extend(_config, arguments[0]);
    }
};

Class.app = function (app) {
    if (!_loaded) {
        _app_queue.push(app);
        return;
    }
    var loader = Class.config('app-loader');
    loader(app);
};

Class.start = function () {
    _loaded = true;
    while (_app_queue.length) {
        var args = _app_queue.shift();
        Class.app(args);
    }
}

Class.config({'app-loader': function (app) {
        var canvas = null,
                context = null,
                full = true,
                width = 0,
                height = 0,
                ratio = 1;

        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        var body = document.body;
        body.insertBefore(canvas, body.firstChild);
        context = canvas.getContext('2d');

        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = context.webkitBackingStorePixelRatio
                || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio
                || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
        ratio = devicePixelRatio / backingStoreRatio;

        resize();
        window.addEventListener('resize', resize, false);
        window.addEventListener('orientationchange', resize, false);
        function resize() {
            if (full) {
                width = (window.innerWidth > 0 ? window.innerWidth : screen.width);
                height = (window.innerHeight > 0 ? window.innerHeight : screen.height);
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
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

window.addEventListener('load', function () {
    Class.start();
}, false);

module.exports = Class;
