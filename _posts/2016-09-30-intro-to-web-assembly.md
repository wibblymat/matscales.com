---
layout:     post
title:      Intro to Web Assembly
date:       2016-09-30 13:29:10
summary:    A brief introduction to what Web Assembly is and why you might want to use it.
categories: wasm web-assembly
---

For a long time people have been compiling to JS, treating it as the machine code of the web. Some of the decisions made in the design of JS have been to make it a better compile target, sometimes at a small cost to the usability of the language for regular developers.

Web Assembly, or Wasm, is instead a real binary executable format for the web. This is a compile target that is distinct from JS, but that still works with the model of the web. By being a completely separate compile target Wasm can grow features that JS couldn't (or shouldn't), without affecting the JS language.

Experimental support for Web Assembly is now available in Chrome, Firefox and Microsoft Edge. In this article I will discuss Wasm as it stands in the current stable and beta versions of Chrome (versions 53 and 54). Development is happening quite fast in the Canary releases (version 55), so some of what I discuss here is no longer true for Canary. As those differences make their way into beta I will cover them in separate posts.

## Wasm for JS developers

There are a whole bunch of ways that developers might need to interact with Wasm. If you're mostly a JS developer, like me, then you will probably get your first contact when you want to use a module that somebody else has made.

There are a few things that you could mean when you say "Web Assembly module". One is the bytes on disk that are the compiled code. Another is a WebAssembly.Module object, which is what you get when you load and parse those bytes. And finally you have the WebAssembly.Instance object. The Module is a template for stamping out Instances, which have all their own memory and such. It's the same as the relationship between a Class and an Object.

If you have a module file it's very easy (if a little boilerplatey) to get an instance of the module.

{% highlight js %}
  var button = document.getElementById('fib');
  var output = document.getElementById('output');

  // Feature detection for Web Assembly
  if ('WebAssembly' in window) {
    fetch('fibonacci.wasm') // Fetch the binary
        .then(response => response.arrayBuffer())
        .then(buffer => WebAssembly.compile(buffer)) // Get a Module from the buffer
        .then(module => {
          // Get an Instance of the Module
          const instance = new WebAssembly.Instance(module);
          // Should output the 20th Fibonacci number in the textarea
          output.value = instance.exports.fibonacci(20);
        });
  } else {
    output.value = "Your browser doesn't support Web Assembly. You may need " +
    "to enable it in your browser's flags.";
  }
{% endhighlight %}

If you want to play along at home you can try this out by enabling Wasm with chrome://flags/#enable-webassembly in Chrome.
<br/>
<button id="fib">Try it!</button>
<textarea id="output"></textarea>
<br/>
<br/>
<script src="/js/intro-wasm.js"></script>
This very basic example calculates Fibonacci numbers.

What that module instance looks like depends on the module. If the module has any exports then the instance will have an `exports` property, which is an object. Currently there are two types of things that could be exported - functions and memory.

Functions will look like regular functions, though when you look at them in devtools you'll see that they are treated as native code:

{% highlight js %}
  function sum() { [native code] }
{% endhighlight %}

The other thing about Wasm functions is that Wasm only has 4 types - 32- and 64-bit integers, and 32- and 64-bit floats. So when you call any Wasm exported function, whatever values you pass will be converted to numbers of the appropriate type.

Functions can also only return a single number of one of those four types. Currently it is an error to call a Wasm function from JS if the return type of the function is int64, because that type isn't actually representable in JS.

Exported memory is always exported with the name `memory`, which means that there can currently only be one per module. The memory export is an ArrayBuffer, and is the exact same memory buffer that the module is using internally to store all of it's data

## Interacting with JavaScript

So once you have a module, you can call it's functions and maybe inspect its memory. Simple!

Of course, given such a simple interface, it might seem that you aren't going to achieve very much. If all a Wasm module can do is arithmetic and passing numbers back and forth, how are people using it to run games?

### Imports
The first way is through *imports*. A Wasm module can declare that it needs certain functions in order to work correctly. You can assign the functions when you create the instance:

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
The other way to get meaningful data out of a module is by inspecting its memory. Let's say that you want the module to be able to print arbitrary strings to the console. Wasm functions can't work with strings, so what do you do?

The Web Assembly module can pass numbers to JS that tell the JS code where in memory to look for the *real* data. For example, you might write a print function like this:

{% highlight js %}
  function print(stringPtr, length) {
    const decoder = new TextDecoder('utf8');
    const stringBytes = new Uint8Array(module.exports.memory, stringPtr, length);
    console.log(decoder.decode(stringBytes));
  }
{% endhighlight %}

What's happening here? Well, a UTF-8 encoded string is, like any other data, stored as just a sequence of bytes in memory. Since our module can only deal with numbers, it can just give us the numbers we need to do useful work. In this case, a pointer to where in memory the string starts, along with how long it is.

This is just one example of how you might interact with the memory of the Instance, but in most situations the module authors will provide their own JS import functions so you shouldn't have to write anything like this unless you are a module author. However, I hope it's useful to understand a little of what is going on underneath.

I think that will do for now. Next time I'm going to talk about compiling C to Wasm.


