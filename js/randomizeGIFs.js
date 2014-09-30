(function() {
  var POSSIBLE_IMAGES = 26,
    TOTAL_IMAGES = 9,
    COLUMNS = 3,
    randomNums = _.shuffle(_.range(1, POSSIBLE_IMAGES + 1)).slice(0, TOTAL_IMAGES),
    loadedImages = 0,
    gifshotLoader = document.querySelector('.gifshot-loader');
    imageRows = Array.prototype.slice.call(document.querySelectorAll('.rows-container'));

  _.each(randomNums, function(num, iterator) {
    iterator += 1;
    var GIF = document.createElement('img'),
      rowNum = Math.ceil(iterator/COLUMNS),
      rowElem = document.querySelector('.gifshot-images .row-' + rowNum);

    GIF.classList.add('hl');
    // Make sure to place the gifshot GIF in the middle every time
    if(iterator === 5) {
      GIF.src = 'images/gifshot.gif';
    } else {
      GIF.src = 'images/gifshot-' + num + '.gif';
    }

    GIF.onload = function() {
      loadedImages += 1;
      if(loadedImages >= TOTAL_IMAGES) {
        gifshotLoader.classList.add('hidden');
        imageRows.forEach(function(currentImageRow) {
          currentImageRow.classList.remove('hidden');
        });
      }
    };

    rowElem.appendChild(GIF);
  });
}());