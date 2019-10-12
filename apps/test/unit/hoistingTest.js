console.log('-- A --');
require('./thisFileLogsX');
console.log('-- B --');
import './thisFileLogsY';
console.log('-- C --');

/*
Current behavior:

-- Y --
-- A --
-- X --
-- B --
-- C --

As Webpack is currently configured, imports are "hoisted" to the top of
the module, the same way variable declarations are hoisted to the top
of their scope in JavaScript.  This means any side-effects in the files
they import may run before code that appears to come before the
import statement. On the other hand, require() runs when it is called,
like any other code.

In practice this is rarely an issue because we try not to use modules
with side-effects, but it comes up occasionally when interfacing with
third-party libraries that depend on one another via globals (e.g.
jQuery and its plugins).

I assume that dynamic imports do not get hoisted - they should behave
like require() does now.  My question is: Does this configuration change
affect regular import statements too? Will it affect the behavior of
this test?
 */

describe('hoistingTest', () => {
  it('is not really a test case', () => {
    console.log('The test ran.');
  });
});
