---
layout:     post
title:      Intro to Web Assembly
date:       2016-08-30 20:27:17
summary:    A brief introduction to what Web Assembly is and why you might want to use it.
categories: wasm web-assembly
---

For a long time people have been compiling to JS, treating it as the machine code of the web. Some of the decisions made in the design of JS have been to make it a better compile target, sometimes at a small cost to the usability of the language for regular developers.

Web Assembly, or WASM, is instead a real binary executable format for the web. This is a compile target that is distinct from JS, but that still works with the model of the web. By being a completely seperate compile target WASM can grow features that JS couldn't (or shouldn't), without affecting the JS language.

## WASM for JS developers

There are a whole bunch of ways that developers might need to interact with WASM. If you're mostly a JS developer, like me, then you probably get your first contact when you want to use a module that somebody else has made.

If you have a module file it's very easy (if a little boiler-platey) to get an instance of the module.

If you want to play along at home you can try this out by enabling WASM with chrome://flags/#enable-webassembly in Chrome.

{% highlight js %}
  fetch('http://matscales.com/fibonacci.wasm')
      .then(response => response.arrayBuffer())
      .then(buffer => new Uint8Array(buffer))
      .then(bytes => new WebAssembly.Module(bytes))
      .then(module => new WebAssembly.Instance(module))
      .then(instance => {
        // Do stuff with the module here
        alert(instance.exports.fibonacci(10));
      });
{% endhighlight %}
<button id="fib">Try it</button>
<script>
  var button = document.getElementById('fib');
  button.addEventListener('click', function() {
    fetch('http://matscales.com/fibonacci.wasm')
        // Fuck you Jekyll!
        .then(function(response) {return response.arrayBuffer();})
        .then(function(buffer) {return new Uint8Array(buffer);})
        .then(function(bytes) {return new WebAssembly.Module(bytes);})
        .then(function(module) {return new WebAssembly.Instance(module);})
        .then(function(instance) {
          // Do stuff with the module here
          alert(instance.exports.fibonacci(10));
        });
  });
</script>
What that module instance looks like depends on the module. If the module has any exports then the instance will have an `exports` property, which is an object. Currently there are two types of things that could be exported - functions and memory.

Functions will look like regular functions, though when you look at them in devtools you'll see that they are treated as native code:

{% highlight js %}
  function sum() { [native code] }
{% endhighlight %}

The other thing about WASM functions is that WASM only has 4 types - 32- and 64-bit integers, and 32- and 64-bit floats. So when you call any WASM exported function, whatever values you pass will be converted to numbers of the appropriate type.

Functions can also only return a single number of one of those four types. Currently it is an error to call a WASM function from JS if the return type of the function is int64, because that type isn't actually representable in JS.

Exported memory is always exported with the name `memory`, which means that there can currently only be one per module. The memory export is an ArrayBuffer, and is the exact same memory buffer that the module is using internally to store all of it's data

## Doing something useful

So once you have a module, you can call it's functions and maybe inspect it's memory. Simple!

Of course, given such a simple interface, it might seem that you aren't going to achieve very much. If all a WASM module can do is arithmetic and passing numbers back and forth, how are people using it to run games?

### Imports
The first way is through *imports*. A WASM module can declare that it needs certain functions in order to work correctly. You can pass the functions to module when you create the instance:

{% highlight js %}
  const imports = {
    console: {
      log: (message) => console.log(message)
    }
  }
  const instance = new WebAssembly.Instance(module, imports);
{% endhighlight %}

Import names always have exactly two parts, which is why the imports object contains another nested object. Inside the module it will declare that it needs a function called "log" in a module called "console", so that's what we have to provide, or module instantiation will fail. It's up to the module creator to either tell you what the specification of these JS functions should be, or to provide a JS script for you.

### Direct memory access
The other way to get meaningful data out of a module is by inspecting it's memory. Let's say that the module imports a function called `print`. You might implement that function like this:

{% highlight js %}
  function print(stringPtr, length) {
    const decoder = new TextDecoder('utf8');
    const stringBytes = new Uint8Array(module.exports.memory, stringPtr, length);
    console.log(decoder.decode(stringBytes));
  }
{% endhighlight %}

What's happening here? Well, a UTF-8 encoded string is, like any other data, stored as just a sequence of bytes in memory. Since our module can only deal with numbers, it can just give us the numbers we need to do useful work. In this case, a pointer to where in memory the string starts, along with how long it is.

You could change this to deal with other ways of dealing with strings, like schemes that have the length as the first byte of the string, or null terminated strings.

You can also squint and imagine how this can be used to pass around more complex data. After all, Objects, Arrays and other data structures are also stored in memory as just a sequence of bytes.

The problem with this, of course, is that you need to understand the contract between the JS function and the WASM module. I think that, realistically, most module providers will just give you the JS library that they built themselves that wraps the loading and instantiating of the module along with appropriate import functions. However, it's probably useful to understand what is going on underneath.

I think that will do for now. Next time I'm going to talk about compiling C to WASM.

// TODO: Provide some simple example modules that people can play around with.
