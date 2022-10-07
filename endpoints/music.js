const router = require('express').Router();

const fetch = require('node-fetch');
const execSync = require("child_process").execSync;
const fs = require('fs');

module.exports = async (req, res) => {
    let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi)
    if (req.query.search === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified search query", data: null })
    if (req.query.search.match(urlRegex)) return res.status(400).send({ success: false, message: "Bad Request 400: No links allowed", data: null })

    fetch(`https://api.deezer.com/search?output=jsonp&q=${encodeURIComponent(req.query.search)}`, {
        headers: {
            "accept": "application/json",
            "accept-language": "fr,fr-FR;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "sec-ch-ua": "\"Microsoft Edge\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "script",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "cross-site"
        },
        "referrer": "https://free-mp3-download.net/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include",

    }).then(function (response) {

        return response.text();
    }).then(function (data) {
        let search = JSON.parse(data.substring(1, data.length - 1));

        if (fs.existsSync(`./tmp/${search.data[0].id}.mp3`)) {
            console.log("exists");
            res.header('Content-Type', 'application/json');
            return res.send({ success: true, body: `https://api.mesavirep.xyz/tmp/${search.data[0].id}.mp3`, ext: '.mp3' })
        }


        let result = execSync(`python3 -m deemix --portable ${search.data[0].link} -p "${process.cwd()}/tmp"`)

        fs.renameSync(`./tmp/${search.data[0].artist.name} - ${search.data[0].title}.mp3`.replace("..mp3", ".mp3"), `./tmp/${search.data[0].id}.mp3`)

        res.header('Content-Type', 'application/json');
        res.send({ success: true, body: `https://api.mesavirep.xyz/tmp/${search.data[0].id}.mp3`, ext: '.mp3' })

        console.log(result.toString("utf-8"));
    })
}
