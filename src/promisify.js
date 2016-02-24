"use strict";

// Promise Context object constructor.
class Context {
  constructor(resolve, reject, custom) {
    this.resolve = resolve;
    this.reject = reject;
    this.custom = custom;
  }
}

const callback = (...args) => {
  const context = args.shift();
  const error = args.shift();

  args = args.length > 1 ? args : args[0];

  if (typeof context.custom === 'function') {
    const custom = (...customArgs) => {
      // Bind the callback to itself, so the resolve and reject
      // properties that we bound are available to the callback.
      // Then we push it onto the end of the arguments array.
      return context.custom.apply(custom, customArgs);
    };
    custom.resolve = context.resolve;
    custom.reject = context.reject;
    custom(error, ...args);
    return;
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
module.exports = (original, custom) => {
  return function (...args) {
    // Store original context
    const self = this;

    // Return the promisified function
    return new Promise((resolve, reject) => {

      // Create a Context object
      const context = new Context(resolve, reject, custom);

      // Append the callback bound to the context
      args.push(callback.bind(null, context));

      // Call the function
      return original.call(self, ...args);
    });
  };
};
