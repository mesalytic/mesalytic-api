const router = require('express').Router();

const Canvas = require('@napi-rs/canvas');

module.exports = async (req, res) => {
    const width = 1200;
    const height = 1200;

    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    function checkIfMandelSet(x, y) {
        let rCompRes = x;
        let iCompRes = y;

        const maxIterations = 300;

        for (let i = 0; i < maxIterations; i++) {
            const trc = rCompRes * rCompRes - iCompRes * iCompRes + x;
            const tic = 2 * rCompRes * iCompRes + y;

            rCompRes = trc;
            iCompRes = tic;

            if (rCompRes * iCompRes > 5) {
                return (i / maxIterations) * 100;
            }
        }

        return 0;
    }

    async function nonBlockLoop(iterations, func, args) {
        let blockedSince = Date.now();

        async function unblock() {
            if (blockedSince + 15 > Date.now()) {
                await new Promise(resolve => setImmediate(resolve));
                blockedSince = Date.now();
            }
        }

        for (let i = 0; i < iterations; i++) {
            await unblock();
            const response = await func(i, args);

            if (response) {
                args = response;
            }

            if (args?.break === true) {
                delete args.break;
                break;
            }
        }
        return args;
    }

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