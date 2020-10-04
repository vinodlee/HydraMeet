import * as bodyPix from '@tensorflow-models/body-pix';

var offScreenCanvases = {};
var CANVAS_NAMES = {
    blurred: 'blurred',
    blurredMask: 'blurred-mask',
    mask: 'mask',
    lowresPartMask: 'lowres-part-mask',
};

function isSafari() {
    return (/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
}

export function drawAndBlur(image, blurAmount, offscreenCanvasName) {
    if (!offScreenCanvases[offscreenCanvasName]) {
        var offScreenCanvas = document.createElement('canvas');
        offScreenCanvases[offscreenCanvasName] = offScreenCanvas;
    }
    var canvas = offScreenCanvases[offscreenCanvasName];
    if (blurAmount === 0) {
        var width = image.width, height = image.height;
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
    }
    else {
        var height = image.height, width = image.width;
        var ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        if (isSafari()) {
            bodyPix.cpuBlur(canvas, image, blurAmount);
        }
        else {
            ctx.filter = "blur(" + blurAmount + "px)";
            ctx.drawImage(image, 0, 0, width, height);
        }
        ctx.restore();
    }
    return canvas;
}

export function drawAndBlurFlip(image, offscreenCanvasName) {
    if (!offScreenCanvases[offscreenCanvasName]) {
        var offScreenCanvas = document.createElement('canvas');
        offScreenCanvases[offscreenCanvasName] = offScreenCanvas;
    }
    var canvas = offScreenCanvases[offscreenCanvasName];
    var width = image.width, height = image.height;
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
}

export function renderImage(image, canvasName) {
    if (!offScreenCanvases[canvasName]) {
        var offScreenCanvas = document.createElement('canvas');
        offScreenCanvases[canvasName] = offScreenCanvas;
    }
    var canvas = offScreenCanvases[canvasName];
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');
    ctx.putImageData(image, 0, 0);
    return canvas;
}

export function createPerson(multiPersonSegmentation, edgeBlurAmount) {
    var backgroundMaskImage = bodyPix.toMask(multiPersonSegmentation, { r: 0, g: 0, b: 0, a: 255 }, { r: 0, g: 0, b: 0, a: 0 });
    var backgroundMask = renderImage(backgroundMaskImage, CANVAS_NAMES.mask);
    if (edgeBlurAmount === 0) {
        return backgroundMask;
    }
    else {
        return drawAndBlur(backgroundMask, edgeBlurAmount, CANVAS_NAMES.blurredMask);
    }
}

function drawWithCompositing(ctx, image, compositOperation) {
    ctx.globalCompositeOperation = compositOperation;
    ctx.drawImage(image, 0, 0);
}

function flipCanvasHorizontal(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
}

export function drawBackground(canvas, image, multiPersonSegmentation, second, backgroundBlurAmount, edgeBlurAmount) {
    if (backgroundBlurAmount === void 0) { backgroundBlurAmount = 3; }
    if (edgeBlurAmount === void 0) { edgeBlurAmount = 3; }
    var blurredImage = drawAndBlurFlip(second, CANVAS_NAMES.blurred);
    canvas.width = blurredImage.width;
    canvas.height = blurredImage.height;
    var ctx = canvas.getContext('2d');
    if (Array.isArray(multiPersonSegmentation) &&
        multiPersonSegmentation.length === 0) {
        ctx.drawImage(blurredImage, 0, 0);
        return;
    }
    var personMask = createPerson(multiPersonSegmentation, edgeBlurAmount);
    ctx.save();
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(personMask, 0, 0);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(blurredImage, 0, 0);
    ctx.restore();
}
