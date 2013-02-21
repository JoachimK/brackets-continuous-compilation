// Use the function form of 'use strict'.
"use strict";

// Function statements should not be placed in blocks
var a, b;
if (a < b) {
    function foo() {
    }
}

// The Function constructor is eval.
a = new Function("test");

// Don't make functions within a loop.
for (a = 0; a < 1; a += 1) {
    var b = function () {
        // test
        
        var x = 2;
    };
    foo(function () {
        a = b;
    });
    foo(function () {
        b = a;
        var x = function () {};
    });
    foo(function () { a = b; });
    foo(function () { var test = function () {}; });
}
var a = function () { while (a < b) {var test = function () {}; } };



// Function statements are not invocable. Wrap the whole function invocation in parens.
function bar() {
    b = a;
}();