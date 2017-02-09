---
layout:     post
title:      BlinkOn and dinosaurs
date:       2017-02-09 00:00:00
summary:    Last week I went to BlinkOn, and I've started work on a VR game
published:  true
comments:   true
---

Hello developers,

Last week I was at BlinkOn 7 in Sunnyvale, California. BlinkOn is a gathering of all of the people that actually make Chrome, where they discuss how to evolve the Blink rendering engine.

There were a lot of talks, and I didn't take notes, so I don't have a great deal to say about it. Sorry! I'll try to remember to post links to the videos when they are up.

Mostly it was an opportunity to meet up with both the Chrome engineers and the Mountain View-based members of the Web DevRel team. It was really nice to go to a conference where neither I nor anyone on my team was stressing out about it, because this one is run by the Chrome team, not us.

## Living the developer life

In my last post I mentioned that one of the ways that I get to relate to developers is by being one, and that usually means creating some sort of sample application. It's a great way to exercise your developer muscles and also gives you a better understanding of the problems that people might have with whatever API or technique it is that you are trying out.

I've got a whole bunch of ideas for things that I'd like to try out but top of my list is WebVR. Paul Lewis and I published a [getting started guide](https://developers.google.com/web/fundamentals/vr/getting-started-with-webvr/), and I've done a little more experimentation since, but I don't really feel like I've grappled with the full set of issues here.

So, I'm going to make a simple game. The idea is to take Chrome's infamous offline dinosaur game and bring it to virtual reality.

For those who don't know, the original game is what is known as an "infinite runner". The dinosaur is running through a desert full of obstacles, and the only thing the player can do is press a button to make them jump. If you time it right the dinosaur can leap clear over each obstacle. And if not then they will crash, and the game is over.

It's an extremely simple game, which makes it ideal for this kind of sample. Almost all of the work to be done will be around making the VR experience feel good, rather than endless tweaking of complex gameplay mechanics or level design.

## Where to begin?

The very first thing I did was knock out a 3D model of the dinosaur in Blender. I'd never made anything in Blender before, so it probably took me half a day, including watching a bunch of tutorials on YouTube.

I then made my first mistake: I decided that since this was a learning exercise, I might as well go all in and learn *all the things*. I created my own rendering engine using WebGL2, written in TypeScript. I have to say this was great fun, and hugely interesting, but as I was finishing up shadow mapping, about two weeks into the project, I realised that I still hadn't done a single thing that Three.js wouldn't have done for me out of the box.

I took a step back and decided to start again, this time using Three.js and ES6.

So, right now I have a very early code base on github at https://github.com/GoogleChrome/dino-vr. All it does is show my dino model spinning in an endless circle.

![Spinning dinosaur](/images/dino-vr.png)

If you have a Daydream View and a compatible phone then you should be able to turn on the WebVR flag in Chrome and get VR working too.

I'm going to start doing developer diary entries about this, with the first one talking about what I've done so far. Look out for that in the next few days.

Happy developing!
