define(function() {
    
    var transEndEventNames,
        supportedCssProperty,
        supportedCssPropertyHash = {},
        hasTransition,
        transitionProperty,
        transitionDuration,
        transitionDelay,
        transitionTimingFunction,
        transitionEndEvent,
        capsRegexp = /[A-Z]/g,
        eventLoopCallbacks = [];

    transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    };
    
    supportedCssProperty = (function() {
        var div = document.createElement('div'),
            prefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'],
            firstCharRegExp = /^[a-z]/,
            len = prefixes.length;
    
        return function(property) {
            var i, prefixedProperty, upperCaseProperty;

            if (supportedCssPropertyHash.hasOwnProperty(property)) {
                return supportedCssPropertyHash[property];
            }
    
            // Check if W3C standard property is supported
            if (typeof div.style[property] !== "undefined") {
                supportedCssPropertyHash[property] = property;
                return property;
            }
    
            // Standard property is not supported, add vendor prefix and test for different vendors.
            upperCaseProperty = property.replace(firstCharRegExp, function(firstChar) {
                return firstChar.toUpperCase();
            });
    
            for (i = 0; i < len; i++) {
                prefixedProperty = prefixes[i] + upperCaseProperty;
                if (typeof div.style[prefixedProperty] !== "undefined") {
                    supportedCssPropertyHash[property] = prefixedProperty;
                    return prefixedProperty;
                }
            }
    
            return null;
        };
    })();
    
    hasTransition = supportedCssProperty('transition') !== null;
    transitionProperty = supportedCssProperty('transitionProperty');
    transitionDuration = supportedCssProperty('transitionDuration');
    transitionDelay = supportedCssProperty('transitionDelay');
    transitionTimingFunction = supportedCssProperty('transitionTimingFunction');
    transitionEndEvent = transEndEventNames[supportedCssProperty('transition')];
    
    function replacementFunction(match) {
        return "-" + match.toLowerCase();
    }

    function executeEventLoopCallbacks() {
        var i, callbacks = eventLoopCallbacks.slice(), callback, func;
        eventLoopCallbacks = [];
        for (i = 0; i < callbacks.length; i++) {
            callback = callbacks[i];
            func = callback.func;
            if (callback.context) {
                func.apply(callback.context);
            } else {
                func();
            }
        }
    }
    
    return {
    
        supportedCssProperty: supportedCssProperty,
    
        hasTransition: hasTransition,
        transitionProperty: transitionProperty,
        transitionDuration: transitionDuration,
        transitionDelay: transitionDelay,
        transitionTimingFunction: transitionTimingFunction,
        transitionEndEvent: transitionEndEvent,
    
        camelCaseToDashes: function(str) {
            return str.replace(capsRegexp, replacementFunction);
        },
    
        domToCSS: function(name) {
            return name.replace(/[A-Z]/g, function(match) {
                return '-' + match.toLowerCase();
            }).replace(/^ms-/, '-ms-');
        },

        cssToDOM: function(name) {
            return name.replace(/-([a-z])/g, function(match, p1) {
                return p1.toUpperCase();
            }).replace(/^[A-Z]/, function(match) {
                return match.toLowerCase();
            });
        },

        requestAnimationFrame: function(callback, context) {
            return window.requestAnimationFrame(function(timestamp) {
                if (context) {
                    callback.apply(context, [timestamp]);
                } else {
                    callback(timestamp);
                }
            }, null);
        },

        executeInNextEventLoop: function(func, context) {
            if (eventLoopCallbacks.length === 0) {
                window.setTimeout(executeEventLoopCallbacks, 0)
            }
            eventLoopCallbacks.push({
                func: func,
                context: context
            });
        },

        /**
         * Extend a given object with all the properties in passed-in object(s).
         * http://underscorejs.org/docs/underscore.html
         */
        extend: function(obj) {
            if (!this.isObject(obj)) return obj;
            var source, prop;
            for (var i = 1, length = arguments.length; i < length; i++) {
                source = arguments[i];
                for (prop in source) {
                    if (hasOwnProperty.call(source, prop)) {
                        obj[prop] = source[prop];
                    }
                }
            }
            return obj;
        },

        /**
         * Fill in a given object with default properties.
         * http://underscorejs.org/docs/underscore.html
         */
        defaults: function(obj) {
            if (!this.isObject(obj)) return obj;
            for (var i = 1, length = arguments.length; i < length; i++) {
                var source = arguments[i];
                for (var prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        if (obj[prop] === void 0) obj[prop] = source[prop];
                    }
                }
            }
            return obj;
        },

        /**
         * Is a given variable an object?
         * http://underscorejs.org/docs/underscore.html
         */
        isObject: function(obj) {
            var type = typeof obj;
            return type === 'function' || type === 'object' && !!obj;
        },

        isFunction: function(obj) {
            return typeof obj === 'function';
        },

        isString: function(obj) {
            return typeof obj === 'string';
        },

        isNumber: function(obj) {
            return typeof obj === 'number';
        },

        isBoolean: function(obj) {
            return typeof obj === 'boolean';
        },

        isArray: Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    };
    
});