const router = require('express').Router();

const math = require('mathjs');

module.exports = async (req, res) => {
    if (req.query.expression === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified Math Expression", data: null })

    req.query.expression.replace("   ", " %2B ")
    require(`./endpoints/math.js`)(req, res);

    let expression = req.query.expression;

    const parsed = math.parse(expression);

    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: parsed.toTex(), ext: '.txt'})
}