import { expect } from 'chai';
import promisify from '../src/promisify';

// Test object. If the 'method' method can see the things
// in its parent, then it will callback with 'thing'.
// Otherwise, will error with the string 'error'.
const o = {
  thing: true,
  method: function (callback) {
    if (this && this.thing) {
      return callback(null, 'thing');
    }
    callback('error');
  }
};

// Test function. If fail is true, will callback with an error.
// Otherwise, will callback with the string 'success'.
function standard(fail, callback) {
  if (fail) {
    return callback('error');
  }
  callback(null, 'success');
}


describe('promisify', () => {
  it('promisify function with default callback', (done) => {
    const promisified = promisify(standard);

    // Call the function, with fail == null.
    // Should resolve correctly, with the string 'success'.
    promisified(null)
      .then(success => {
        expect(success).to.be.equal('success');
        done()
      })
      .catch(error => done(error));
  });

  it('promisify function with default callback (force reject)', (done) => {
    const promisified = promisify(standard);

    // Call the function, with fail == true.
    // Should reject the promise with the string 'error'.
    promisified(true)
      .then(() => done('Unexpected kept promise'))
      .catch(error => {
        // Should reject and land in here.
        expect(error).to.be.not.empty;
        done();
      });
  });

  it('promisify function with custom callback', (done) => {
    // Create the promise-based function with a custom callback
    const promisified = promisify(standard, function (err, result) {
      if (err) {
        return this.reject('custom ' + err);
      }
      this.resolve('custom ' + result);
    });

    // Call the function, with fail == null.
    // Should resolve with the string 'custom success', as the custom
    // callback adds in the 'custom' prefix as it handles the result.
    promisified(null)
      .then(success => {
        // String should equal success
        expect(success).to.be.equal('custom success');
        done();
      }).catch(error => done(error));
  });

  it('promisify function with custom callback (force reject)', (done) => {
    // Create the promise-based function with a custom callback
    const promisified = promisify(standard, function (err, result) {
      if (err) {
        return this.reject('custom ' + err);
      }
      this.resolve('custom ' + result);
    });

    // Call the function, with fail == true.
    // Should reject with the error 'custom error'.
    promisified(true).then(()=> {
      // Shouldn't get in here.
      done('Unexpected kept promise');
    }).catch(error => {
      // Should reject the promise and land in here.
      expect(error).to.be.equal('custom error');
      done();
    });
  });

  it('promisify method with default callback', (done) => {
    // Promisify a method, binding it to it's parent context
    const promisified = promisify(o.method.bind(o));
    promisified()
      .then(thing => {
        // String should equal success
        expect(thing).to.be.equal('thing');
        done();
      }).catch(error => done(error));
  });

  it('promisify method with default callback (broken context)', (done) => {
    // Promisify a method, without binding to it's parent. We expect this to fail.
    const promisified = promisify(o.method);
    promisified()
      .then(() => {
        done('Unexpected kept promise');
      }).catch(error => {
      // Should reject the promise and land in here.
      expect(error).to.be.equal('error');
      done();
    });
  });

  it('promisify method with default callback (same context)', (done) => {
    // Promisify a method, preserving it's parent context
    o.methodPromisified = promisify(o.method);
    o.methodPromisified()
      .then(thing => {
        // String should equal success
        expect(thing).to.be.equal('thing');
        done();
      })
      .catch(error => done(error));
  });

  it('promisify method with custom callback', (done) => {
    // Promisify a method, binding it to it's parent context
    const promisified = promisify(o.method.bind(o), function (err, result) {
      if (err) {
        return this.reject('custom ' + err);
      }
      this.resolve('custom ' + result);
    });

    promisified()
      .then(thing => {
        // String should equal 'custom thing'
        expect(thing).to.be.equal('custom thing');
        done();
      })
      .catch(error => done(error));
  });

  it('promisify method with custom callback (broken context)', (done) => {
    // Promisify a method, binding it to it's parent context
    const promisified = promisify(o.method, function (err, result) {
      if (err) {
        return this.reject('custom ' + err);
      }
      this.resolve('custom ' + result);
    });

    promisified()
      .then(() => {
        // Shouldn't get in here.
        done('Unexpected kept promise');
      })
      .catch(error => {
        // Should get a custom error in here.
        expect(error).to.be.equal('custom error');
        done()
      });
  });

  it('promisified function called multiple times', (done) => {
    let counter = 0;
    const promisified = promisify(cb => {
      setTimeout(() => {
        counter += 1;
        cb(null, counter);
      }, 50);
    });

    Promise.all([
        promisified(),
        promisified(),
        promisified()
      ])
      .then(results => {
        expect(results).to.be.deep.equal([1, 2, 3]);
        done();
      });
  });

  it('promisified function callback with multiple arguments', (done) => {
    const promisified = promisify(cb => {
      setTimeout(() => {
        cb(null, 1, 2, 3);
      });
    });

    promisified().then(result => {
      expect(result).to.be.deep.equal([1, 2, 3]);
      done();
    });
  });
});
