/*jslint browser: true */

var x = 123, c = 1;
var f = 0,
    g = 0,
    h;
var y = 36;
var z = y - x + 30;
var a = z * z;
var b = Math.sqrt(a);
b = c = 2;
var i;
for (i = 0; i < 10; i += 1) {
    b *= c;
}

// unexpected_typeof_a: Unexpected 'typeof'. Use '===' to compare directly with {a}
if (typeof a === "undefined") {
    
}


function foo(alreadyDefined) {
    "use strict";
    
    var alreadyDefined;
    z = arguments.caller;
    
myLoop:
    for (x = 0; x < 10; x += 1) {
        if (a < b) {
            break myLoop;
        }
        
        myLoop = 2;
    }
}

try {
    // Some code that might throw an exception
} catch (e) {
    e = 10;
}


x && a.push(x);
a + b;

//Expected a conditional expression and instead saw an assignment.
if (c = 1) {
    c = a = 2;
    a + b;
}

// Expected '===' and instead saw '=='
if (c == 1) {
    c = 2;
}

if (c != 1) {
    c = 2;
}

document = true;

var theArray = [70, 30, 5, 2, 10, 5, 11, 12, 80];
var testString = "hallo";
var j;
if (a === 2 && b === 3 || z) {
    a = 2;
}
for (j = 0; j < theArray.length - 1; j += 1) {
    for (i = j; i < theArray.length - 1; i += 1) {
        while (theArray[i] > theArray[i + 1]) {
            var temp = theArray[i];
            theArray[i] = theArray[i + 1];
            theArray[i + 1] = temp;
            //break;
        }
    }
}

// A cnstructor name '{a}' should start with an uppercase letter
a = new foo();

// Unexpected dangling '_' in '{a}'
var bla = 2;

// Only properties should be deleted.
if (delete bla) {
    x = 2;
    delete bla;
}

// Duplicate {a}
var a = {
    foo : "",
    foo : 2
};

var foo;
a = {foo : "", foo : foo};
var b;

b = {foo: {foo: a}, foo: {bar: "", foo: bla}};

switch (a) {
case "bla":
    b = a;
    break;
case "bla":
    c = a;
    break;
}