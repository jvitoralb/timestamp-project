import express from 'express';
import cors from 'cors';
import dns from 'node:dns';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Shortener, { createSave } from './shortenerApp.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

/**
 *  Timestamp API project
**/

app.get('/timestamp', (req, res) => {
    res.sendFile(`${__dirname}/public/timestamp.html`);
});

app.get('/timestamp/api/', (req, res) => {
    const now = new Date();
    res.json({
        unix: now.getTime(),
        utc: now.toUTCString()
    });
});

app.use('/timestamp/api/:date?', (req, res, next) => {
    const isValidReq = new Date(req.params.date);
    const unixReq = Number(req.params.date);
    const newDateTime = new Date();

    if (!isValidReq.getDate()) {
        newDateTime.setTime(unixReq);

        return newDateTime.toUTCString() !== 'Invalid Date' ? 
        res.json({unix: unixReq, utc: newDateTime.toUTCString()}) :
        res.json({error: 'Invalid Date'});
    }
    next();
});

app.get('/timestamp/api/:date?', (req, res) => {
    const dateReq = new Date(req.params.date);
    const unixTimestamp = dateReq.getTime();
    res.json({
        unix: unixTimestamp,
        utc: dateReq.toUTCString()
    });
});

/**
 *  Request header parser API project
**/

app.get('/req-header-parser', (req, res) => {
    res.sendFile(`${__dirname}/public/reqheader.html`);
});

app.get('/req-header-parser/api/whoami', (req, res) => {
    res.json({
        ipaddress: req.ip,
        language: req.acceptsLanguages().join(','),
        software: req.headers['user-agent']
    });
});

/**
 *  URL Shortener 
**/
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    let urlToCheck = req.body.url;

    if (urlToCheck.includes('https://')) {
        urlToCheck = urlToCheck.replace('https://', '');
    }
    dns.lookup(urlToCheck, (err, address, family) => {
        if (err) {
            console.log(err);
            return res.json({error: 'invalid url'});
        }
        next();
    });
});

app.get('/url-shortener', (req, res) => {
   res.sendFile(`${__dirname}/public/urlshortener.html`);
});

app.post('/url-shortener/api/shorturl', (req, res, next) => {
    createSave(req.body.url, (err, savedData) => {
        if (err) {
            return err.code === 11000 ? next('E11000 duplicate key error') : next(err);
        }
        console.log('created');
        Shortener.findById(savedData._id, (err, short) => {
            if (err) return next(err);
            res.json({
                original_url: short.mainUrl,
                short_url: short.shortUrlCode
            });
        });
    });
});

app.get('/url-shortener/api/shorturl/:shortID', (req, res) => {
    res.send(req.params);
})

const listener = app.listen(PORT, () => {
    console.log(`Server has started on port ${listener.address().port}`);
});