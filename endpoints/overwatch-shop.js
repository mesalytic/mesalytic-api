const router = require('express').Router();
const Canvas = require('canvas');
const request = require('node-superfetch');
const fs = require('fs');

const { getOverwatchShop } = require('../Utils');

module.exports = async (req, res) => {
    let lang;

    if (!req.query.lang || (req.query.lang != "en-us" && req.query.lang != "fr-fr")) lang = "en-us";
    else lang = req.query.lang;

    let arr = [];

    let getData = () => new Promise((resolve, reject) => {
        let shopJSON = JSON.parse(fs.readFileSync('./assets/overwatch.json'));

        if (Object.entries(shopJSON).length === 0) {
            getOverwatchShop(lang).then(shop => {
                let json = JSON.stringify(shop);

                fs.writeFile("./assets/overwatch.json", json, 'utf8', function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The file was saved!");
                    resolve(JSON.parse(fs.readFileSync('./assets/overwatch.json')))
                });
            })
        } else {
            let json = JSON.parse(fs.readFileSync('./assets/overwatch.json'))

            if (json.reset.timestamp - Date.now() <= 0) {
                getOverwatchShop("en-us").then(shop => {
                    let json = JSON.stringify(shop);

                    fs.writeFile("./assets/overwatch.json", json, 'utf8', function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log("The file was saved!");
                        resolve(JSON.parse(fs.readFileSync('./assets/overwatch.json')))
                    });
                })
            } else resolve(JSON.parse(fs.readFileSync('./assets/overwatch.json')))
        }
    })

    getData().then(async data => {
        console.log(req.query.gen);
        if (!req.query.gen || Boolean(req.query.gen) === false) {
            res.header('Content-Type', 'application/json');
            return res.send({ success: true, json: data, ext: '.json' })
        } else {
            Canvas.registerFont(`./assets/ObjectSans-Heavy.otf`, {
                family: 'Object Sans'
            });

            Canvas.registerFont(`./assets/Noto-Regular.ttf`, {
                family: "Noto"
            })

            Canvas.registerFont("./assets/Noto-Bold.ttf", {
                family: "Noto Bold"
            })

            for (let i = 0; i < data.items.length; i++) {
                const { body } = await request.get(data.items[i].img);

                const banner = await Canvas.loadImage(body);
                const currency = await Canvas.loadImage("./assets/OW2_VirtualCurrency.png")

                const canvas = Canvas.createCanvas(368, 401);
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#23252B";
                ctx.fillRect(0, 0, canvas.width - 1, canvas.height - 1);
                ctx.drawImage(banner, 0, 0, banner.width / 5.2 - 3, banner.height / 5.2 - 3);

                ctx.textAlign = "center";
                ctx.font = "bold 29px Object Sans Heavy";
                ctx.fillStyle = "#DCDCDD"
                ctx.fillText(data.items[i].name, canvas.width * 0.5, 250)

                ctx.fillStyle = "#ffffffb8";
                ctx.font = "18px Noto"
                ctx.fillText(data.items[i].tags, canvas.width * 0.5, 280)

                ctx.font = "67px Noto Bold"
                ctx.fillText(data.items[i].price.replace("Overwatch Coins", "").replace("Pièces Overwatch", ""), canvas.width * 0.5 + 55, 365)

                ctx.drawImage(currency, 59, 295, currency.width / 1.1, currency.height / 1.1)

                arr.push(canvas.toBuffer());
            }

            let width;
            let height;

            if (arr.length <= 3) {
                width = 368 * arr.length
                height = 401 + 150;
            } else {
                width = 368 * 3
                height = 401 * Math.ceil(arr.length / 3) + 150
            }

            const finalCanvas = Canvas.createCanvas(width, height);
            const finalCtx = finalCanvas.getContext('2d');

            finalCtx.fillStyle = "#23252B";
            finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

            let widthIndex = 0;
            let heightIndex = 0;

            console.log(arr);

            for (let i = 0; i < arr.length; i++) {

                console.log(widthIndex, heightIndex);

                const image = await Canvas.loadImage(arr[i]);
                finalCtx.drawImage(image, widthIndex * 368, heightIndex * 401 + 150);

                if (widthIndex + 1 >= 3) {
                    widthIndex = 0;
                    heightIndex++;
                } else widthIndex++;
            }

            finalCtx.textAlign = "center";
            finalCtx.font = "bold 65px Object Sans Heavy";
            finalCtx.fillStyle = "#DCDCDD"
            finalCtx.fillText("Weekly Shop", finalCanvas.width * 0.5, 85)

            finalCtx.font = "25px Object Sans Heavy"
            finalCtx.fillText(`Resets every Tuesday at 7pm UTC (${data.reset.text})`, finalCanvas.width * 0.5, 130)

            res.header('Content-Type', 'application/json');
            res.send({ success: true, json: data, body: new Buffer.from(finalCanvas.toBuffer(), 'base64'), ext: '.png' })
        }
    })
}