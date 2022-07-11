const isImageUrl = require('is-image-url');
const fs = require('fs');

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

var endpointList = [];

fs.readdir('./endpoints', (err, files) => {
    files.forEach(file => endpointList.push(file.slice(0, -3)))
})

app.get('/', (req, res) => {
    res.status(200).send({ endpoints: endpointList })
});

app.use('/:endpoint', async (req, res) => {
    console.log(req.query);
    if (["fractal"].includes(req.params.endpoint)) require(`./endpoints/${req.params.endpoint}.js`)(req, res);
    else {
        if (req.query.url === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No specified image url", data: null })
        if (!isImageUrl(req.query.url)) return res.status(400).send({ success: false, message: "Bad Request 400: Invalid image url", data: null })
    
        require(`./endpoints/${req.params.endpoint}.js`)(req, res);
    
    }
})

app.get('*', (req, res) => {
    res.status(404).send('404');
})

app.listen(8239);
console.log('API Running');