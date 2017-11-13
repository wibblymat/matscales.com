---
layout:     post
title:      Dev Diary - Starting a WebVR game
date:       2017-02-14 00:00:00
summary:    Starting work on my WebVR game
published:  true
comments:   true
---

Hello developers,

When I first said on Twitter that I was working on a game I promised Developer Diaries.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Today: I&#39;m going to make a web VR game demo. Started locally, need approval to work on it in public. Should be fine, expect a dev diary!</p>&mdash; Mat Scales (@wibblymat) <a href="https://twitter.com/wibblymat/status/827303829951574016">February 2, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

I fully intended to write these up *during* the coding, so that it was an accurate reflection of what I did. Instead I kept getting distracted by the *doing* part, so the first couple of these may end up being more of a commit log archaeology dig.

[All of the source code for the project is on Github](https://github.com/GoogleChrome/dino-vr).

## Where to begin?

There's a lot of boilerplate involved in modern web work, and I don't want to bore anyone, so I'm just going to briefly talk about the project setup.

My current build process of choice is using [Rollup](http://rollupjs.org/) + [Babel](https://babeljs.io/). I use `rollup-watch` and have a terminal window open just running `rollup -cw` so that my source code changes are reflected in the built version pretty quickly. For me it takes about ~1s between saving and the build finishing even though I'm including ThreeJS, which is quite big.

I also include `eslint` with a lightly modified version of the Google config for linting. The actual linting all happens in my editor rather than on the command line, though.

## Taming ThreeJS

One of the reasons why I am using Rollup is to apply its tree shaking magic to the [ThreeJS WebGL library](https://threejs.org/). The minified build of ThreeJS is 492K, while at the time of writing the minified build of my game JS *including* ThreeJS is only 354K.

How is this possible?

Well, I'm importing only the parts of Three that I need. So instead of:

{% highlight js %}
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
{% endhighlight %}

I am doing:

{% highlight js %}
import 'three/src/polyfills.js';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Scene} from 'three/src/scenes/Scene';

const renderer = new WebGLRenderer();
const scene = new Scene();
{% endhighlight %}

This is certainly more effort because I need to find the right file for each thing that I want to use, and I need to maintain the list of imports. The advantage, however, is that smaller build size.

As I understand it there is work going on inside ThreeJS to further decouple things, so this strategy will have even more benefit in the future.

This technique requires a little extra work in the rollup config. In order to import something that I installed with npm I need to use `rollup-plugin-node-resolve`. And ThreeJS has it's own slight complication because it needs to import shaders written in GLSL. However, this can be easily solved by copying the GLSL snippet from [ThreeJS' own Rollup config](https://github.com/mrdoob/three.js/blob/dev/rollup.config.js#L1-L24) into my rollup config and then using it like any other plugin.

## Resizing a canvas to fill the window

I know that for my game I want the canvas to fill the window when we aren't in VR mode. I've chosen to absolutely position the canvas on top of the body, which I've given a width of 100% and a height of 100vh.

{% highlight css %}
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
canvas {
  position: absolute;
  top: 0;
}
{% endhighlight %}

The absolute positioning is mostly so that I can also position the VR toggle button on top of the canvas.

Then you just have to remember to set the size of the canvas in JS, too.

{% highlight js %}
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.updateMatrix();
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
{% endhighlight %}

You can run this code on resize, but I'm actually running it every frame.

There are, apparently, 100s of ways of doing this same thing, but this is mine - and now I have a convenient place to look the next time I need to remember what it is.

I think this is a good place to wrap up. For those playing along at home, this pretty much brings us up to the 3rd of February in the [commit history](https://github.com/GoogleChrome/dino-vr/tree/2f0d09f841efd2c938e0eaed02645135abb9eb95).

Next time I'll talk about entering VR mode. Catch you then!
