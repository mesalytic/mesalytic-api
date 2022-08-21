const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const { invert } = require('../Utils');

module.exports = async (req, res) => {
    const pixel = 5 / 100;
    
    const { body } = await request.get(req.query.url);
    const avatar = await Canvas.loadImage(body);
    
    const canvas = Canvas.createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(avatar, 0, 0);
    ctx.drawImage(avatar, 0, 0, canvas.width * pixel, canvas.height * pixel);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, canvas.width * pixel, canvas.height * pixel, 0, 0, canvas.width + 5, canvas.height + 5)

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}