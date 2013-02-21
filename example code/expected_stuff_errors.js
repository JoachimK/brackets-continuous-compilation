// Expected '{a}' and instead saw '{b}'.
var a = 2
var b, B = 2;

if (a == b) {
    a = 2;
}

// Expected an identifier and instead saw '{a}' (a reserved word).
var undefined = 2;


// Expected exactly one space between '{a}' and '{b}'.
if (a) {
    a = 2;
}else  { //
    a = 2;
}

var a = function()  {"use strict"; var a = function()    {};                         } ;


// Expected '{a}' at column {b}, not column {c}.
    var a = 1;
if (a) {
b = 2;
}
if (a) {
if (b) {
a = 2; // Test
} // Test
}
if (a) {
    if (b) {
    a = 2; // Test
    }
}

// The body of a for in should be wrapped in an if statement 
// to filter unwanted properties from the prototype.
for (b in a) {
    a = b;
}
for (b in a) {  
    a = b;
}
for (b in a) { b = a;
    }

for (b in a)
    { b = a;
        }

for (b in a) { // do stuff
    b = a;
}

for (a = 0; a < 1; a += 1) { for (b in a) {
    a = b;
}
    }

for (b in a)
    {
        // do stuff
        a = b;
    }

for (a = 1; a < 2; a += 1) { for (a in b) { a = b; } }
for (b in a) { a = b; }

// empty class
a = /[]/;
a = /[abc][]*/;

// Expected an identifier and instead saw '{a}'.
a.= 2;