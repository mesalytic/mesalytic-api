const router = require('express').Router();

const Canvas = require('@napi-rs/canvas');
const request = require('node-superfetch');

module.exports = async (req, res) => {
    const { body } = await request.get(req.query.url);

    const base = await Canvas.loadImage("./assets/bob-ross.png");
    const avatar = await Canvas.loadImage(body);

    const canvas = Canvas.createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, base.width, base.height);
    ctx.rotate(3 * (Math.PI / 180));
    ctx.drawImage(avatar, 30, 19, 430, 430);
    ctx.rotate(-3 * (Math.PI / 180));
    ctx.drawImage(base, 0, 0);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}