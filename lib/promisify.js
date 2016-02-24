"use strict";

// Promise Context object constructor.

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Context = function Context(resolve, reject, custom) {
  _classCallCheck(this, Context);

  this.resolve = resolve;
  this.reject = reject;
  this.custom = custom;
};

var callback = function callback() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var context = args.shift();
  var error = args.shift();

  args = args.length > 1 ? args : args[0];

  if (typeof context.custom === 'function') {
    var _ret = function () {
      var custom = function custom() {
        for (var _len2 = arguments.length, customArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          customArgs[_key2] = arguments[_key2];
        }

        // Bind the callback to itself, so the resolve and reject
        // properties that we bound are available to the callback.
        // Then we push it onto the end of the arguments array.
        return context.custom.apply(custom, customArgs);
      };
      custom.resolve = context.resolve;
      custom.reject = context.reject;
      custom.apply(undefined, [error].concat(args));
      return {
        v: undefined
      };
    }();

    if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
  }

  if (error) {
    return context.reject(error);
  }
  return context.resolve(args);
};

/**
 * promisify
 *
 * Transforms callback-based function -- func(arg1, arg2 .. argN, callback) -- into
 * an ES6-compatible Promise. User can provide their own callback function; otherwise
 * promisify provides a callback of the form (error, result) and rejects on truthy error.
 * If supplying your own callback function, use this.resolve() and this.reject().
 *
 * @param {function} original - The function to promisify
 * @param {function} custom - Optional custom callback function
 *
 * @return {function} A promisified version of 'original'
 */
module.exports = function (original, custom) {
  return function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    // Store original context
    var self = this;

    // Return the promisified function
    return new Promise(function (resolve, reject) {

      // Create a Context object
      var context = new Context(resolve, reject, custom);

      // Append the callback bound to the context
      args.push(callback.bind(null, context));

      // Call the function
      return original.call.apply(original, [self].concat(args));
    });
  };
};
//# sourceMappingURL=promisify.js.map