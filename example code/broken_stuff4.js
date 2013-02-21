/*jslint browser: true */
// Do not use {a} as a constructor.
var str = new String("hello"),
    num = new Number(10),
    bool = new Boolean(false),
    math = new Math(),
    json = new JSON({ myProp: 10 });

var a, b;

// Mixed spaces and tabs

//  	Some stuff

// '{a}' is not a label.
for (a = 0; a < 0; a += 1) {
    if (a < b) {
        break a;
    }
}

// Missing radix parameter.
a = parseInt(b());

// Read only
document = a;

// Reserved name '{a}'.
var __iterator__ = 2;
