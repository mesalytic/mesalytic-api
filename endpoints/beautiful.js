const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const isImageUrl = require('is-image-url');

module.exports = async (req, res) => {
    if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified image url", data: null })
    if (!isImageUrl(req.query.url)) return res.status(400).send({ success: false, message: "Bad Request 400: Invalid image url", data: null })
        
    const { body } = await request.get(req.query.url);

    const base = await Canvas.loadImage("./assets/beautiful.png");
    const avatar = await Canvas.loadImage(body);

    const canvas = Canvas.createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, base.width, base.height);
    ctx.drawImage(avatar, 249, 24, 105, 105);
    ctx.drawImage(avatar, 249, 223, 105, 105);
    ctx.drawImage(base, 0, 0);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}