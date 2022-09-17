const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const GIFEncoder = require('gifencoder');
const { drawImageWithTint, streamToArray } = require('../Utils');

module.exports = async (req, res) => {
    if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified image url", data: null })
    if (!isImageUrl(req.query.url)) return res.status(400).send({ success: false, message: "Bad Request 400: Invalid image url", data: null })
        
    const { body } = await request.get(req.query.url);
    const avatar = await Canvas.loadImage(body);

    const canvas = Canvas.createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(avatar.width, avatar.height);
    const stream = encoder.createReadStream();

    encoder.start();
    encoder.setRepeat(100);
    encoder.setDelay(100);
    encoder.setQuality(200);

    for (let i = 0; i < 31; i += 2) {
        const frameID = `frame-${i.toString().padStart(2, '0')}.png`;
        const frame = await Canvas.loadImage(`./assets/fire/${frameID}`);
        const ratio = frame.width / frame.height;
        const height = Math.round(avatar.width / ratio);

        drawImageWithTint(ctx, avatar, '#fc671e', 0, 0, avatar.width, avatar.height);
        ctx.drawImage(frame, 0, avatar.height - height, avatar.width, height);

        encoder.addFrame(ctx);
    }
    encoder.finish();

    const buffer = await streamToArray(stream);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.concat(buffer), ext: '.gif'})
}