const router = require('express').Router();

const Canvas = require('canvas');
const request = require('node-superfetch');
const isImageUrl = require('is-image-url');

module.exports = async (req, res) => {
    if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified image url", data: null })
    if (!isImageUrl(req.query.url)) return res.status(400).send({ success: false, message: "Bad Request 400: Invalid image url", data: null })
    if (req.query.title === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No Custom Spotify Title", data: null })
    if (req.query.author === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No Custom Title Author", data: null })
    

    const base = await Canvas.loadImage('./assets/spotify.png');

    const author = req.query.author;
    const title = req.query.title;

    const { body } = await request.get(req.query.url);
    const avatar = await Canvas.loadImage(body);
    
    const canvas = Canvas.createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    const height = 504 / avatar.width;

    Canvas.registerFont(`${process.cwd()}/assets/Noto-Regular.ttf`, {
        family: 'Noto'
    });
    Canvas.registerFont(`${process.cwd()}/assets/Noto-CJK.otf`, {
        family: 'Noto'
    });
    Canvas.registerFont(`${process.cwd()}/assets/Noto-Emoji.ttf`, {
        family: 'Noto'
    });
    Canvas.registerFont(`${process.cwd()}/assets/Noto-Bold.ttf`, {
        family: 'Noto'
    });

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, base.width, base.height);
    ctx.drawImage(avatar, 65, 132, 504, height * avatar.height);
    ctx.drawImage(base, 0, 0);
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = "normal bold 25px Noto";
    ctx.fillStyle = "white";
    ctx.fillText(author, base.width / 2, 685);
    ctx.fillStyle = "#bdbec2";
    ctx.font = "20px Noto";
    ctx.fillText(title, base.width / 2, 720);
    ctx.fillText("Your Picks", base.width / 2, 65);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}