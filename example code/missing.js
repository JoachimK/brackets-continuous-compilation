// Missing '{a}'.
var ConstructorLike, a, b;
a = ConstructorLike();
a = String(b); // not a problem

// Missing '{a}' after '{b}'.
switch (a) {
case "a":
    a = b;
case "b":
    b = a;
    break;
case "c": a = 2; // test
default:
    break;
}

// Expected '{a}' and instead saw '{b}'.
function foo() { return 2}

// Missing space between '{a}' and '{b}'.
a = a+a;

// Missing "use strict"
a = function () {};
a = function () {
    var b;
};

// Missing property name.
a = {: 22};