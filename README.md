Powercanvas
===========

With power canvas you can use a HTML &lt;canvas> element as a board where to place images and text. It lets you add borders, colorful captions, shades and scale, rotate, resize, reorder anything you pour in it! I originally wrote this for a school project, but the script works quite well by itself too, so here it is in the form of a super-simple library. It uses [oCanvas] and jQuery.
Feel free to try it out. I included a very simple usage example in this repository, which doesn't let you play too much with text and borders, but it's better than nothing...

##Usage
As shown in the example, place your canvas element somewhere, give it a size (WIDTH= and HEIGHT=...) and an id (e.g. powercanvas), then initialize it:
```
var p = PowerCanvas("powercanvas");
```

At that point you can go on with inserting an image or two:
```
p.insertImage("http://www.whatever.com/imageaddress.png",100,100) //Path to image, X position, Y position
```

And then start playing with it. You can select images by clicking on them, or unselect everything by clicking in any empty point of the canvas.

Some functions will make some handles appear, that you can drag around to interact with the selected image in a similar way to how you would do it on PowerPoint or Photoshop:
```
p.move();
p.rotate();
p.scale();
p.shade(); //This is my favourite *_*
``` 

Other commands are just one-time actions that don't require additional interactions:
```
p.setBorders(5,"#ff0000") //width and color
p.addCaption("Any text you want","#0000ff","Ariel") //Content, color, font. You can resize, rotate, add shades and borders to these too!
p.bringFront();
p.sendBack();
p.erase();
```
##Output Example
When you will be a powercanvas ninja (and a good photographer :P) you will be able to put together things like this:
![alt tag](https://raw.github.com/mrgreenh/powercanvas/master/example_result.png)

[oCanvas]: https://github.com/koggdal/ocanvas