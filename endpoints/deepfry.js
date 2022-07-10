const router = require('express').Router();

const Canvas = require('@napi-rs/canvas');
const request = require('node-superfetch');
const path = require('path');

module.exports = async (req, res) => {
    const { body } = await request.get(req.query.url);
    
    const avatar = await Canvas.loadImage(body);
    
    const canvas = Canvas.createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext('2d');

    function desaturate(ctx, level, x, y, width, height) {
        const data = ctx.getImageData(x, y, width, height);
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const dest = ((i * width) + j) * 4;
                const grey = Number.parseInt(
                    (0.2125 * data.data[dest]) + (0.7154 * data.data[dest + 1]) + (0.0721 * data.data[dest + 2]), 10
                );
                data.data[dest] += level * (grey - data.data[dest]);
                data.data[dest + 1] += level * (grey - data.data[dest + 1]);
                data.data[dest + 2] += level * (grey - data.data[dest + 2]);
            }
        }
        ctx.putImageData(data, x, y);
        return ctx;
    }

    function contrast(ctx, x, y, width, height) {
        const data = ctx.getImageData(x, y, width, height);
        const factor = (259 / 100) + 1;
        const intercept = 128 * (1 - factor);

        for (let i = 0; i < data.data.length; i += 4) {
            data.data[i] = (data.data[i] * factor) + intercept;
            data.data[i + 1] = (data.data[i + 1] * factor) + intercept;
            data.data[i + 2] = (data.data[i + 2] * factor) + intercept;
        }

        ctx.putImageData(data, x, y);
        return ctx;
    }

    ctx.drawImage(avatar, 0, 0);
    desaturate(ctx, -20, 0, 0, avatar.width, avatar.height);
    contrast(ctx, 0, 0, avatar.width, avatar.height);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}