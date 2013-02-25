"use strict";
// Unescaped '{a}'.
var a = /+/;
var b = /)/;
b = /]/;

// Unexpected '{a}'.
debugger;


// Unexpected /*property*/
/*properties
    test, write
*/

a.test2 = 3;

/*properties
    test2
*/

a.test2 = 3;


// Unexpected space between '{a}' and '{b}'.
a = a + b ;
a = ( a + b );
if (a && (b && (a)) ) {
    a = b;
}
a = (    "hallo" + "welt" );
a = ( 'hallo' + 'welt'    );

// It is not necessary to initialize '{a}' to 'undefined'.
var o = undefined, foo = undefined,
    c,
    d = undefined,
    bla = undefined;


// Unnecessary 'use strict'.
function foo() {"use strict"; }

// Unreachable '{a}' after '{b}'.
for (a = 2; a < b; a += 1) {
    if (a < b) {
        break;
        a = b;
    }
}

// Use the array literal notation [].
a = new Array(2, 3);
a = [2, 3];
a = new Array(2, 3);

a = ["2"];
a = new Array("2");

a = [2];
a = new Array(2);

// Spaces are hard to count. Use {{a}}.
a = /    /;
a = /sa e      jb   *rh/;


// Use the object literal notation {}.
a = new Object();

// Use the || operator.
a = (b) ? b : 40;

// Use a named parameter.
function foo(x) {
    a = arguments[0];
}

// '{a}' was used before it was defined.
bar = 2;


// Weird assignment.
a = a;

// Weird condition.
if (a || a) { a = b; }

// Weird relation.
a = (a === a) ? a : b;

// Weird construction. Delete 'new'.
a = new function () {
    
};

// Weird ternary.
a = b ? 2 : 2;

// Wrap an immediate function invocation in parentheses to assist the reader in 
// understanding that the expression is the result of a function, and not the 
// function itself.
a = function (x) { a = x; }(function () {}, a);
a = function () { a = b; }();
a = function () { a = b; }(
    a,
    b
);

// Move the invocation into the parens that contain the function.
a = (function () {})();

// Wrap the /regexp/ literal in parens to disambiguate the slash operator.
function bar() {
    return / *[\s,\w]+(a|b)/.test(b);
}

/*jslint browser: true */
document.write("");
document. write("");

// Variable {a} was not declared correctly.
var a1, a2 = a = a[0];

