const isImageUrl = require('is-image-url');

const express = require('express');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, opt) => {
        let headers = res.getHeaders();
        
        res.status(opt.statusCode).send({success: false, message: "You have been rate-limited. Please try again later.", timeoutSeconds: headers['ratelimit-reset']})
    }
})

const app = express();

app.use(limiter);

app.get('/', (req, res) => {
    res.status(400).send({ success: false, message: "Bad Request: No Endpoint Specified"});
});

app.use('/:endpoint', async (req, res) => {
    console.log(req.query);
    if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified image url", data: null })
    if (!isImageUrl(req.query.url)) return res.status(400).send({ success: false, message: "Bad Request 400: Invalid image url", data: null })

    require(`./endpoints/${req.params.endpoint}.js`)(req, res);
})

app.get('*', (req, res) => {
    res.status(404).send('404');
})

app.listen(8239);
console.log('API Running');