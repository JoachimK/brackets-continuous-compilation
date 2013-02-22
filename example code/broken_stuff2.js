/*jslint browser: true */
"use strict";
var a, b;

a = (function () {}());

// Implied eval is evil. Pass a function instead of a string.

setTimeout("alert(2)");
setInterval("alert(3)");


// Unexpected 'in'. Compare with undefined, or use the hasOwnProperty method instead.
var hasTheProperty = "something" in a;

// Insecure '{a}'.
a = /./;
a = /[^b]/;

// Use the isNaN function to compare with NaN.
if (a === NaN) { a = b; }


// A leading decimal point can be confused with a dot: '.{a}'.
a = .22;

/* Nested Comments
/* dleje ef 
*/
