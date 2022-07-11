const router = require('express').Router();

const Canvas = require('@napi-rs/canvas');
const request = require('node-superfetch');
const path = require('path');
const { centerImagePart } = require('../Utils');

module.exports = async (req, res) => {
    const { body } = await request.get(req.query.url);

    const base = await Canvas.loadImage("./assets/3000-years.png");
    const avatar = await Canvas.loadImage(body);

    const canvas = Canvas.createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(base, 0, 0);
    const {x, y, width, height } = centerImagePart(avatar, 200, 200, 461, 127);
    ctx.drawImage(avatar, x, y, width, height);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}