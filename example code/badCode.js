var x;
var y;

// Use spaces, not tabs
if (x < y) {
	x = 1;
    if (y < x) {
    	y = 2;
        if (x === y) {
    		      x = y;
        }
    }
}

// missing space
x = x+ y;
x = x +y;
x = x+ y;

// bad assignment examples
x.size() = function () {"use strict"; };
x = y + 2 = 3;

// bad for in variable
var someItems = [];
for (something in someItems) {
    if (someItems.hasOwnProperty(something)) {
        x = 2;
    }
}

var a, b, c;
if (a = 3) {
    b = 2;
}

// Bad invocation
var doThing;
(doThing = function () { "use strict"; })();
"test hallo"();

// bad_new
function MyObject() {"use strict"; }
new MyObject();

// bad operand
if (a && !b++) {
    c = x;
}


// Combine this with the previous 'var' statement.
function _test() {
    "use strict";
    var g;
    var h;
}

// confusing use of {a}
if (!a === b) {
    c = a;
}

// Empty block
if (a === b) {} else { /* hallo */ }
if (a < b) {
        
} else { c = 3; }
if (a < b) {
    
} // test
  
  // test 2
if (b < a) {
    c = 2;
    if (a < c) {
        if (a < c) {
            // Some comment 
        } // test
    }
}


// empty case
if (a) {
    switch (a) {
    case 2:
    }
}
switch (a) {
case "test":
            // do stuff
            // bla
}
switch (a) { case "test": }
        
        
// eval is evil
a = eval("2+3");
        
// empty block special edition (with end of file afterwars)  
if (a + 2) {
    
}