const router = require('express').Router();

const Canvas = require('canvas');
const { secondsToDhms } = require('../Utils');
const { get } = require('node-superfetch');

Canvas.registerFont('./assets/toru.otf', {
    family: "Torus"
})

module.exports = async (req, res) => {
    if (req.query.user === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No Username Specified", data: null })
    if (req.query.mode === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No GameMode specified", data: null })
    
    let userQuery = req.query.user;
    let modeQuery = req.query.mode;

    let mode;
    switch(modeQuery) {
        case 'osu': mode = 0; break;
        case 'taiko': mode = 1; break;
        case 'ctb': mode = 2; break;
        case 'mania': mode = 3; break;
    }

    let { body } = await get("https://osu.ppy.sh/api/get_user").query({ k: "e639ac3ec6ae881ccfc1cd0798d389dbddf1f497", u: userQuery, m: mode, type: "string" })

    console.log(body);


    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: await generateCanvas(body[0], modeQuery), ext: '.png'})
}

async function generateCanvas(user, mode) {
    const canvas = Canvas.createCanvas(1137, 523);
    const ctx = canvas.getContext('2d');

    const image = await Canvas.loadImage("./assets/osu.png");
    const pfp = await Canvas.loadImage(`https://a.ppy.sh/${user.user_id}`);
    const flag = await Canvas.loadImage(`https://assets.ppy.sh/old-flags/${user.country}.png`);
    const modeImg = await Canvas.loadImage(`./assets/mode-${mode}.png`)

    ctx.drawImage(image, 0, 0, 1137, 523);
    ctx.drawImage(flag, 988, 57, 95, 62);
    ctx.drawImage(modeImg, 535, 190, 64, 64);

    ctx.font = "45px Torus";
    ctx.fillStyle = "white";
    ctx.fillText(user.username, 350, 105);

    ctx.fillStyle = "#CECECE";
    ctx.font = "45px Torus";
    ctx.fillText(`#${user.pp_rank}`, 350, 155);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "white";
    ctx.font = "35px Torus";
    ctx.fillText(`${Math.floor(user.pp_raw)}pp`, 439, 220);

    ctx.fillStyle = "gray";
    ctx.font = "30px Torus";
    ctx.fillText(`(#${Math.floor(user.pp_country_rank)})`, 439, 270);

    ctx.fillStyle = "white";
    ctx.font = "38px Torus";
    ctx.fillText(Math.floor(user.level).toString(), 899, 86);

    ctx.font = "50px Torus";
    ctx.fillText("Accuracy", 186, 353);
    
    ctx.font = "45px Torus";
    ctx.fillText("Play Time", 990, 250);

    ctx.font = "35px Torus";
    ctx.fillText(secondsToDhms(user.total_seconds_played), 990, 297);

    ctx.font = "38px Torus";
    ctx.fillText(`${Math.round(user.accuracy * 100) / 100}%`, 186, 400);

    ctx.fillStyle = "#CECECE";
    ctx.font = "18px Torus";
    ctx.fillText(user.join_date.split(" ")[0].replace("-", "/").replace("-", "/"), 185, 30);

    ctx.fillStyle = "white";
    ctx.font = "35px Torus";
    ctx.fillText(user.count_rank_a, 627, 416);
    ctx.fillText(user.count_rank_s, 733, 416);
    ctx.fillText(user.count_rank_sh, 843, 416);
    ctx.fillText(user.count_rank_ss, 953, 416);
    ctx.fillText(user.count_rank_ssh, 1063, 416);

    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(185, 185, 125, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(pfp, 60, 60, 250, 250);

    let buffer = new Buffer.from(canvas.toBuffer(), 'base64');

    return buffer;
}