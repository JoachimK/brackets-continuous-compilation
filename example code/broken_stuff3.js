/*jslint vars: true */
"use strict";
var a, b;
// Mixed spaces and tabs.

a = (function () {})();
a = (function () {
    b = a;
})(b, 22);

// Move 'var' declarations to the top of the function.
for (var i = 1; i < 2; i += 1) {
    
}