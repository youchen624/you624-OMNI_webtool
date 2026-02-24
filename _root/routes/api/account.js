const express = require('express');
const router = express.Router();

router.get('/preference', (req, res) => {
    // 假設從資料庫找到該帳號的預設是 'desktop'
    // 如果沒登入，可以回傳 null
    res.json({ layout: 'desktop' });
});

module.exports = router;