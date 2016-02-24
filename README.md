# babel-promisify

[![Build Status](https://travis-ci.org/Pitzcarraldo/babel-promisify.svg)](https://travis-ci.org/Pitzcarraldo/babel-promisify)
[![Coverage Status](https://coveralls.io/repos/github/Pitzcarraldo/babel-promisify/badge.svg?branch=master)](https://coveralls.io/github/Pitzcarraldo/babel-promisify?branch=master)
[![npm version](https://img.shields.io/npm/v/babel-promisify.svg?style=flat-square)](https://www.npmjs.com/package/babel-promisify)
[![npm downloads](https://img.shields.io/npm/dm/babel-promisify.svg?style=flat-square)](https://www.npmjs.com/package/babel-promisify)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/Pitzcarraldo/babel-promisify)


Converts callback-based functions to Babel or Native Promises. This module is babel port of [es6-promisify](https://github.com/digitaldesignlabs/es6-promisify).

## Install

Install with [npm](https://npmjs.org/package/babel-promisify)

```bash
npm install --save babel-promisify
```

## Example

```js
"use strict";

// Declare variables
var promisify = require("babel-promisify"),
    fs = require("fs"),

// Convert the stat function
    stat = promisify(fs.stat);

// Now usable as a promise!
stat("example.txt").then(function (stats) {
    console.log("Got stats", stats);
}).catch(function (err) {
    console.error("Yikes!", err);
});
```

## Provide your own callback
```js
"use strict";

// Declare variables
var promisify = require("babel-promisify"),
    fs = require("fs"),
    stat;

// Convert the stat function, with a custom callback
stat = promisify(fs.stat, function (err, result) {
    if (err) {
        console.error(err);
        return this.reject("Could not stat file");
    }
    this.resolve(result);
});

stat("example.txt").then(function (stats) {
    console.log("Got stats", stats);
}).catch(function (err) {
    // err = "Could not stat file"
});
```

## Promisify methods
```js
"use strict";

// Declare variables
var promisify = require("babel-promisify"),
    redis = require("redis").createClient(6379, "localhost"),

// Create a promise-based version of send_command
    client = promisify(redis.send_command.bind(redis));

// Send commands to redis and get a promise back
client("ping", []).then(function (pong) {
    console.log("Got", pong);
}).catch(function (err) {
    console.error("Unexpected error", err);
}).then(function () {
    redis.quit();
});
```

### Tests
Test with mocha & chai
```bash
$ npm test
```

Published under the [MIT License](LICENSE).
