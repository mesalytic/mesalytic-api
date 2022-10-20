const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const { invert, sepia } = require('../Utils');
const isImageUrl = require('is-image-url');

module.exports = async (req, res) => {
    if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified image url", data: null })
    if (!isImageUrl(req.query.url)) return res.status(400).send({ success: false, message: "Bad Request 400: Invalid image url", data: null })
        
    const base = await Canvas.loadImage('./assets/wanted.png');
    
    const { body } = await request.get(req.query.url);
    const avatar = await Canvas.loadImage(body);
    
    const canvas = Canvas.createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(base, 0, 0);
    ctx.drawImage(avatar, 150, 360, 430, 430);
    sepia(ctx, 150, 360, 430, 430);
    
    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}