const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const GIFEncoder = require('gifencoder');
const { drawImageWithTint, streamToArray } = require('../Utils');

module.exports = async (req, res) => {
    const base = await Canvas.loadImage('./assets/triggered.png');

    const { body } = await request.get(req.query.url);
    const avatar = await Canvas.loadImage(body);

    const canvas = Canvas.createCanvas(base.width, base.width);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(base.width, base.width);
    const stream = encoder.createReadStream();

    encoder.start();
    encoder.setRepeat(100);
    encoder.setDelay(100);
    encoder.setQuality(200);

    const coord1 = [-25, -33, -42, -14];
    const coord2 = [-25, -13, -34, -10];

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, base.width, base.width);

    for (let i = 0; i < 4; i++) {
        drawImageWithTint(ctx, avatar, "red", coord1[i], coord2[i], 300, 300);
        ctx.drawImage(base, 0, 218, 256, 38);
        encoder.addFrame(ctx);
    }

    encoder.finish();

    const buffer = await streamToArray(stream);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.concat(buffer), ext: '.gif'})
}