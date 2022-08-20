const router = require('express').Router();

const Canvas = require('canvas');

const { nonBlockLoop, checkIfMandelSet } = require('../Utils');

module.exports = async (req, res) => {
    const width = 1200;
    const height = 1200;

    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const magnificationFactor = 2000;
    const panX = Math.random() * 2;
    const panY = Math.random() * 1;
    
    for (let x = 0; x < canvas.width; x++) {
        await nonBlockLoop(
            canvas.height,
            (iteration, args) => {
                const belongsToSet = args.checkBelongs(args.x / args.magnificationFactor - args.panX, iteration / args.magnificationFactor - args.panY);
                if (belongsToSet === 0) {
                    args.ctx.fillStyle = '#000';
                    args.ctx.fillRect(args.x, iteration, 1, 1);
                } else {
                    args.ctx.fillStyle = `hsl(165, 100%, ${belongsToSet}%)`;
                    args.ctx.fillRect(args.x, iteration, 1, 1);
                }
            },
            { ctx, magnificationFactor, panX, panY, x, checkBelongs: checkIfMandelSet },
        );
    }

    ctx.translate(width / 2, height / 2);
    ctx.rotate((Math.floor(Math.random() * 360) * Math.PI) / 180);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: new Buffer.from(canvas.toBuffer(), 'base64'), ext: '.png'})
}