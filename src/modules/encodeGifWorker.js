define(function() {
    var workerCode = function worker() {

        self.onmessage = function(ev) {
            workerMethods.encodeGif(ev.data);
        };

        var workerMethods = {
            'encodeGif': function(obj) {
                var frames = obj.frames,
                    framesLength = frames.length,
                    buffer = obj.buffer,
                    width = obj.width,
                    height = obj.width,
                    gifOptions = obj.gifOptions,
                    delay = obj.delay,
                    onRenderProgressCallback = obj.onRenderProgressCallback,
                    gifWriter = new GifWriter(buffer, width, height, gifOptions),
                    x = -1,
                    frame,
                    framePalette,
                    bufferToString,
                    gif;

                while(++x < framesLength) {
                    frame = frames[x];
                    framePalette = frame.palette;

                    postMessage({
                        'complete': false,
                        'frame': frame
                    });

                    gifWriter.addFrame(0, 0, width, height, frame.pixels, {
                        palette: framePalette,
                        delay: delay
                    });
                }

                gifWriter.end();

                bufferToString = workerMethods.bufferToString(buffer);

                gif = 'data:image/gif;base64,' + workerMethods.btoa(bufferToString);

                postMessage({
                    'complete': true,
                    'gif': gif
                });
            },
            'byteMap': (function() {
                var byteMap = [];
                for(var i = 0; i < 256; i++) {
                    byteMap[i] = String.fromCharCode(i);
                }
                return byteMap;
            }()),
            'bufferToString': function(buffer) {
                var numberValues = buffer.length,
                    str = '',
                    x = -1;

                while(++x < numberValues) {
                    str += this.byteMap[buffer[x]];
                }

                return str;
            },
            // window.btoa polyfill
            'btoa': function (input) {
                var output = '', i = 0, l = input.length,
                key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                while (i < l) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) enc3 = enc4 = 64;
                    else if (isNaN(chr3)) enc4 = 64;
                    output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
                }
                return output;
            }
        }
    };
    return workerCode;
});