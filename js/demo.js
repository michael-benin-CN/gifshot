(function() {
  var createGIFButton = document.querySelector('.create-gif-button'),
    takeSnapShotButton = document.querySelector('.take-snapshot-button'),
    gifSource = document.querySelector('#GIFSource'),
    interval = document.querySelector("#interval"),
    numFrames = document.querySelector("#numFrames"),
    gifHeight = document.querySelector("#gifHeight"),
    gifWidth = document.querySelector("#gifWidth"),
    progressBar = document.querySelector("progress"),
    text = document.querySelector('#gifText'),
    fontWeight = document.querySelector('#fontWeight'),
    fontSize = document.querySelector('#fontSize'),
    fontFamily = document.querySelector('#fontFamily'),
    fontColor = document.querySelector('#fontColor'),
    textAlign = document.querySelector('#textAlign'),
    textBaseline = document.querySelector('#textBaseline'),
    numWorkers = document.querySelector('#numWorkers'),
    gifshotImagePreview = document.querySelector('.gifshot-image-preview-section');

  createGIFButton.addEventListener('click', function(e) {
    gifshot.createGIF({
      'video': gifSource.value === 'video' ? ['example.mp4', 'example.ogv'] : false,
      'images': gifSource.value === 'images' ? ['http://i.imgur.com/2OO33vX.jpg', 'http://www.google.com/think/images/google-trends_tools_sm.jpg', 'http://i.imgur.com/qOwVaSN.png', 'http://i.imgur.com/Vo5mFZJ.gif'] : false,
      'text': text.value,
      'fontWeight': fontWeight.value,
      'fontColor': '#FFF',
      'fontSize': fontSize.value,
      'fontFamily': fontFamily.value,
      'fontColor': fontColor.value,
      'textBaseline': textBaseline.value,
      'textAlign': textAlign.value,
      'interval': +interval.value,
      'numWorkers': numWorkers.value,
      'numFrames': +numFrames.value,
      'gifHeight': +gifHeight.value,
      'gifWidth': +gifWidth.value,
      'progressCallback': function(captureProgress) {
        progressBar.value = captureProgress;
      }
    }, function(obj) {
      if (!obj.error) {
        var image = obj.image,
          animatedImage = document.createElement('img');
        animatedImage.src = image;

        gifshotImagePreview.appendChild(animatedImage);
      } else {
        console.log('obj', obj);
        console.log('obj.error', obj.error);
        console.log('obj.errorCode', obj.errorCode);
        console.log('obj.errorMsg', obj.errorMsg);
      }
    });
  }, false);

  takeSnapShotButton.addEventListener('click', function(e) {
    gifshot.takeSnapShot({
      'video': gifSource.value === 'video' ? ['example.mp4', 'example.ogv'] : false,
      'images': gifSource.value === 'images' ? ['http://i.imgur.com/2OO33vX.jpg', 'http://www.google.com/think/images/google-trends_tools_sm.jpg', 'http://i.imgur.com/qOwVaSN.png', 'http://i.imgur.com/Vo5mFZJ.gif'] : false,
      'text': text.value,
      'fontWeight': fontWeight.value,
      'fontColor': '#FFF',
      'fontSize': fontSize.value,
      'fontFamily': fontFamily.value,
      'fontColor': fontColor.value,
      'textBaseline': textBaseline.value,
      'textAlign': textAlign.value,
      'interval': +interval.value,
      'numWorkers': numWorkers.value,
      'numFrames': +numFrames.value,
      'gifHeight': +gifHeight.value,
      'gifWidth': +gifWidth.value,
      'progressCallback': function(captureProgress) {
        progressBar.value = captureProgress;
      }
    }, function(obj) {
      if (!obj.error) {
        var image = obj.image,
          animatedImage = document.createElement('img');
        animatedImage.src = image;

        gifshotImagePreview.appendChild(animatedImage);
      }
    });
  }, false);
}());