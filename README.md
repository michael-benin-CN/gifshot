###An Animated GIF is Worth a Thousand Words 

![](http://i.imgur.com/I17GUX9.gif)

Today we are happy to open source gifshot.js, a client-side JavaScript library that can create animated GIFs from media streams (e.g. webcam), videos (e.g. mp4), or images (e.g. png). Gifshot leverages cutting edge browser APIs (sorry IE9 and below) such as WebRTC, FileSystem, Video, Canvas, Web Workers, Typed Arrays, and Base 64 Encoding, to automate the GIF creation process using only client-side JavaScript. The client-side nature of the library makes it extremely portable and easy to integrate into almost any website (sort of like animated GIFs themselves).

Piggybacking on the idea of simplicity, we also created an easy to use API, so that you can start creating GIFs right away.  Let's take a look at an example:

```javascript
// Create the GIF from a user's webcam
gifshot.createGIF(function(obj) {
  // If there is not an error
  if(!obj.error) {
    // Stores the base 64 encoded image
    var image = obj.image,
      // Creates an image DOM element
      animatedImage = document.createElement('img');

    // Sets the src attribute of the image DOM element to the base 64 image
    animatedImage.src = image;
    // Adds the image DOM element to the page
    document.body.appendChild(animatedImage);
  }
});
```

For more details and examples, check out the full API documentation and our extensive list of options.

Gifshot was originally created during a Yahoo Sports team hackathon. The hackathon project allowed Yahoo Fantasy users to talk "smack" to other league members, by creating and publishing funny animated GIFs of themselves. After testing this feature internally, we soon learned what the internet has known for over 25 years; animated GIFs are fun.

The Yahoo Sports team recently released this feature to all Yahoo Fantasy leagues, so try going to your team matchup page and clicking on the red record icon at the bottom right corner of your page to start creating your GIFs! If you aren't in a Yahoo Fantasy Football league yet, make sure to not miss out on the fun and [create an account](http://football.fantasysports.yahoo.com/f1/signup/) now.

Happy GIF'ing!
