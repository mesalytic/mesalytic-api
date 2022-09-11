const router = require('express').Router();

const math = require('mathjs');

module.exports = async (req, res) => {
    let expression = req.query.expression;

    const parsed = math.parse(expression);



    res.header('Content-Type', 'application/json');
    res.send({ success: true, body: parsed.toTex(), ext: '.txt'})
}