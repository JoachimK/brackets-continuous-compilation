/*jslint maxlen: 100*/
var a, b;

// Expected to see a statement and instead saw a block.
if (a < b) {
    a = b;
}
{a = b; }
{
// test

a = b;
    }

if (a < b) {
  { a = b; }
}
{
{
var a = b;
    }
    }

// Strict violation.
function foo() {
    "use strict";
    a = this.b;
    this.b = 2;
}

// ['{a}'] is better written in dot notation.
a = b["test"];
a['test'] = b;
a[""] = b; // that's fine
a["hallo welt"] = b; // as is this
a[b] = b; // or this


// Line too long.
// Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et



// A regular expression literal can be confused with '/='.
a = /= abc/;