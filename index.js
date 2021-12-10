const express = require('express');
const app = express();
const port = process.argv[2] ? process.argv[2] : 8085;

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use('/v1/doc', express.static('docs/.vuepress/dist'));

app.use(function (req, res, next) {
    res.status(404).sendFile('docs/.vuepress/dist/404.html', {
        root: __dirname
    });
});

app.listen(port, () => console.log(`${new Date().toLocaleString()} App listening on port ${port}!`));