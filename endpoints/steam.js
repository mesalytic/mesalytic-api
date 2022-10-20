const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const { shortenText } = require('../Utils');
const isImageUrl = require('is-image-url');

module.exports = async (req, res) => {
    if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified image url", data: null })
    if (!isImageUrl(req.query.url)) return res.status(400).send({ success: false, message: "Bad Request 400: Invalid image url", data: null })
    if (req.query.game === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No Custom Steam Game", data: null })
    if (req.query.player === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No Custom Steam User", data: null })
    
    const base = await Canvas.loadImage('./assets/steam.png');

    const player = req.query.player;
    const game = req.query.game;

    const { body } = await request.get(req.query.url);
    const avatar = await Canvas.loadImage(body);
    
    const canvas = Canvas.createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    const height = 504 / avatar.width;

    Canvas.registerFont(`./assets/Noto-Regular.ttf`, {
        family: 'Noto'
    });
    Canvas.registerFont(`./assets/Noto-CJK.otf`, {
        family: 'Noto'
    });
    Canvas.registerFont(`./assets/Noto-Emoji.ttf`, {
        family: 'Noto'
    });


    ctx.drawImage(base, 0, 0);
    ctx.drawImage(avatar, 21, 21, 32, 32);
    ctx.fillStyle = "#90ba3c";
    ctx.font = "10px Noto";
    ctx.fillText(player, 63, 26);
    ctx.fillText(shortenText(ctx, game, 160), 63, 54)

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}