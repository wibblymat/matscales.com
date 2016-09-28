'use strict';
/* global WebAssembly */

var button = document.getElementById('fib');
var output = document.getElementById('output');

button.addEventListener('click', function() {
  // Feature detection for Web Assembly
  if ('WebAssembly' in window) {
    fetch('/fibonacci.wasm') // Fetch the binary
        .then(function(response) {
          return response.arrayBuffer();
        }).then(function(buffer) {
          return WebAssembly.compile(buffer); // Get a Module from the buffer
        }).then(function(module) {
          // Get an Instance of the Module
          const instance = new WebAssembly.Instance(module);
          // Should show an alert with the 20th Fibonacci number
          output.value = instance.exports.fibonacci(20);
        });
  } else {
    output.value = "Your browser doesn't support Web Assembly. You may need " +
    "to enable it in your browser's flags.";
  }
});
