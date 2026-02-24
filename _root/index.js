// console.log("begin");
// app.js
const express = require('express');
const app = express();
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', './views');
const ejs = require('ejs');


function render(res, page, data = {}) {
    ejs.renderFile(`views/pages/${page}.ejs`, data, (err, content) => {
        res.render('layout', {
            ...data,
            body: content
        });
    });
}

app.get('/chat', (req, res) => {
    render(res, 'chat', { title: '聊天' });
});

app.get('/todo', (req, res) => {
    render(res, 'todo', { title: '待辦' });
});



// 404
app.use((req, res) => {
    res.status(404).send('抱歉，找不到該頁面。');
});

// 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('伺服器目前出了一些問題，請稍後再試。');
});

/// Windows (PowerShell): $env:NODE_ENV="production"; node index.js

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`伺服器已啟動：http://localhost:${PORT}`);
});