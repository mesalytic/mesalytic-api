const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const isImageUrl = require('is-image-url');

const { blur } = require('../Utils');

module.exports = async (req, res) => {
    if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified image url", data: null })
    if (!isImageUrl(req.query.url)) return res.status(400).send({ success: false, message: "Bad Request 400: Invalid image url", data: null })
        
    const { body } = await request.get(req.query.url);
    
    const avatar = await Canvas.loadImage(body);
    const dimensions = avatar.width <= avatar.height ? avatar.width : avatar.height;

    const canvas = Canvas.createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const createImageData = (w, h) =>
        Canvas.createCanvas(w, h)
            .getContext('2d')
            .getImageData(0, 0, w, h);

    const quality = 5;
    const hRadius = 5;
    const vRadius = 5;

    var srcPixels = imageData.data,
        srcWidth = imageData.width,
        srcHeight = imageData.height,
        srcLength = srcPixels.length,
        dstImageData = createImageData(srcWidth, srcHeight),
        dstPixels = dstImageData.data,
        tmpImageData = createImageData(srcWidth, srcHeight),
        tmpPixels = tmpImageData.data;

        for (var i = 0; i < quality; i += 1) {
            blur(
                i ? dstPixels : srcPixels,
                tmpPixels,
                srcWidth,
                srcHeight,
                hRadius
            );
            blur(tmpPixels, dstPixels, srcHeight, srcWidth, vRadius);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(dstImageData, 0, 0);
        
        res.header('Content-Type', 'application/json');
        res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}