const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const { grayscale } = require('../Utils');

module.exports = async (req, res) => {
    const { body } = await request.get(req.query.url);
    const avatar = await Canvas.loadImage(body);
    
    const canvas = Canvas.createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(avatar, 0, 0);
    grayscale(ctx, avatar.width, avatar.height)

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}