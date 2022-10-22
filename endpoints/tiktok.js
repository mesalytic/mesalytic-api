const router = require('express').Router();

const tiktokscraper = require("tiktok-scraper-ts");

module.exports = async (req, res) => {
    if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified url", data: null });

    try {
        res.header('Content-Type', 'application/json');
        res.send({ success: true, body: await tiktokscraper.fetchVideo(req.query.url), ext: null})
    } catch {
        res.header('Content-Type', 'application/json');
        res.send({ success: false, message: "The link is either not a valid TikTok URL, or there's an issue with TikTok's server."})
    }
}



