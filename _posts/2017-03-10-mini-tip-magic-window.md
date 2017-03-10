---
layout:     post
title:      WebVR mini-tip - Magic Window
date:       2017-03-10 00:00:00
summary:    An easy first step towards full VR is a "magic window" view that uses the orientation of the user's device to change the view.
published:  true
comments:   true
---

Hello developers,

This is just a quick tip on how to ease yourself into a VR way of thinking with the smallest amount of effort possible.

If you want to go straight to full-on VR then you can go to the [getting started post](https://developers.google.com/web/fundamentals/vr/getting-started-with-webvr/) I co-authored with the wonderful Paul Lewis.

If you want to do it one step at a time, read on...

## Magic Window

One thing that wasn't addressed at all in the original post is so-called "magic window" mode. Magic window mode uses the sensors on the device to provide orientation information, but doesn't present the scene in stereo to the headset.

If you're not sure what that might look like, I made a quick video.

<iframe width="560" height="315" src="https://www.youtube.com/embed/a45ReRH7sxk" frameborder="0" allowfullscreen></iframe>

So, how do we do this? The good news is that this is a very easy thing to do.

First, we need to get the details of the VR display.

We should probably check that the display has the `hasOrientation` capability bit set, though I can't imagine a VR device that doesn't.

If we are only offering magic window and nothing else then we also want to filter out displays that have the `hasExternalDisplay` capability. It *probably* means that it is moving the external display that will change the orientation, rather than moving the device itself. We're intending to add full VR later though, so I'm not doing that here.

{% highlight js %}
let vrdisplay;
let frameData; // To hold the orientation info, amongst other things.

// Check that WebVR is supported
if ('getVRDisplays' in navigator) {
  // Now we know that VR is supported, we can initialise the frame data object
  frameData = new VRFrameData();

  // Get an array of all available VR displays
  navigator.getVRDisplays().then(displays => {
    // Filter out any (hypothetical) display that doesn't support orientation
    displays = displays.filter(d => d.capabilities.hasOrientation);

    // If we have suitable displays, pick the first one. Otherwise, we will
    // leave vrdisplay as undefined.
    if (displays.length > 0) {
      vrdisplay = displays[0];
    }
  });
}
{% endhighlight %}

Next up, we get the device orientation and use it to update the camera in our render loop.

{% highlight js %}
if (vrdisplay) {
  // Update framedata. This object holds the current position and orientation of
  // the VR display, among other things.
  vrdisplay.getFrameData(frameData);

  // Do a bit of a dance with the Three.JS camera object to use our own view matrix

  // We don't want our camera matrix to be overwritten by Three
  camera.matrixAutoUpdate = false;

  // Set the camera's view matrix to the device view matrix
  camera.matrix.fromArray(frameData.leftViewMatrix);

  // Three actually needs the inverse of the view matrix that WebVR gives us
  camera.matrix.getInverse(camera.matrix);

  // Now update the camera's world matrix, which applies its own matrix to the
  // matrix of its parent.
  camera.updateMatrixWorld(true);

  // Finally, tell the display that we are done with this frame. This is more
  // relevant when we are presenting to the device, but it signals to the
  // display that the next time we call getFrameData we want fresh values.
  vrdisplay.submitFrame();
}
{% endhighlight %}

And there you have it. You can now update the in game camera position based on the orientation of the users device.

In this post I am using Three.JS, but if you are using WebGL directly this may be even easier - just use the `frameData.leftViewMatrix` as the view matrix that you send to your shaders.
