(function(window, document) {
  var createGIFButton = document.querySelector('#create-gif'),
    gifSource = document.querySelector('#GIFSource'),
    gifType = document.querySelector('#GIFType'),
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
    sampleInterval = document.querySelector('#sampleInterval'),
    numWorkers = document.querySelector('#numWorkers'),
    gifshotImagePreview = document.querySelector('.gifshot-image-preview-section'),
    placeholderDiv = document.querySelector('.placeholder-div'),
    placeholderDivDimensions = document.querySelector('.placeholder-div-dimensions'),
    gifshotCode = document.querySelector('.gifshot-code'),
    gifshotCodeTemplate = document.querySelector('.gifshot-code-template'),
    getSelectedOptions = function() {
      return {
        'gifWidth': +gifWidth.value,
        'gifHeight': +gifHeight.value,
        'images': gifSource.value === 'images' ? ['http://i.imgur.com/2OO33vX.jpg', 'http://i.imgur.com/qOwVaSN.png', 'http://i.imgur.com/Vo5mFZJ.gif'] : false,
        'video': gifSource.value === 'video' ? ['example.mp4', 'example.ogv'] : false,
        'interval': +interval.value,
        'numFrames': +numFrames.value,
        'text': text.value,
        'fontWeight': fontWeight.value,
        'fontSize': fontSize.value,
        'fontFamily': fontFamily.value,
        'fontColor': fontColor.value,
        'textAlign': textAlign.value,
        'textBaseline': textBaseline.value,
        'sampleInterval': +sampleInterval.value,
        'numWorkers': +numWorkers.value
      }
    },
    passedOptions,
    updateCodeBlock = function(obj) {
      obj = obj || {};
      var targetElem = obj.targetElem,
        selectedOptions = getSelectedOptions(),
        options = (function() {
          var obj = {};

          _.each(selectedOptions, function(val, key) {
            if(val) {
              obj[key] = val;
            }
          });

          return obj;
        }()),
        template = _.template(gifshotCodeTemplate.innerHTML, {
          gifshot: window.gifshot,
          selectedOptions: options,
          method: gifType.value === 'snapshot' ? 'takeSnapShot' : 'createGIF'
        }),
        code = escodegen.generate(esprima.parse(template), {
          format: {
            safeConcatenation: true
          }
        });

      gifshotCode.innerHTML = code;

      Prism.highlightElement(gifshotCode);

      if (targetElem && (targetElem.id === 'gifWidth' || targetElem.id === 'gifHeight')) {
        if(selectedOptions.gifHeight && selectedOptions.gifWidth) {
          gifshotImagePreview.innerHTML = '';
          placeholderDiv.style.height = selectedOptions.gifHeight + 'px';
          placeholderDiv.style.width = selectedOptions.gifWidth + 'px';
          placeholderDivDimensions.innerHTML = selectedOptions.gifWidth + ' x ' + selectedOptions.gifHeight;
          if(selectedOptions.gifWidth < 60 || selectedOptions.gifHeight < 20) {
            placeholderDivDimensions.classList.add('hidden');
          } else {
            placeholderDivDimensions.classList.remove('hidden');
          }
          placeholderDiv.classList.remove('hidden');
        } else {
          placeholderDiv.classList.add('hidden');
        }
      }
    },
    bindEvents = function() {
      createGIFButton.addEventListener('click', function(e) {
        passedOptions = _.merge(_.clone(getSelectedOptions()), {
          'progressCallback': function(captureProgress) {
            gifshotImagePreview.innerHTML = '';
            placeholderDiv.classList.add('hidden');
            progressBar.classList.remove('hidden');
            progressBar.value = captureProgress;
          }
        });

        var method = gifType.value === 'snapshot' ? 'takeSnapShot' : 'createGIF';

        gifshot[method](passedOptions, function(obj) {
          if (!obj.error) {
            var image = obj.image,
              animatedImage = document.createElement('img');
            animatedImage.src = image;

            progressBar.classList.add('hidden');
            progressBar.value = 0;

            gifshotImagePreview.appendChild(animatedImage);
          } else {
            console.log('obj.error', obj.error);
            console.log('obj.errorCode', obj.errorCode);
            console.log('obj.errorMsg', obj.errorMsg);
          }
        });
      }, false);

      document.addEventListener('change', function(e) {
        updateCodeBlock({
          targetElem: e.target
        });
      });

      document.addEventListener('keyup', function(e) {
        updateCodeBlock({
          targetElem: e.target
        });
      });
    };

    bindEvents();
    updateCodeBlock({
      targetElem: gifWidth
    });
}(window, document));