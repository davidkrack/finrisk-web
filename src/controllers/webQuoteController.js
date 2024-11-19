const path = require('path');

const showWebQuote = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/web-quote.html'));
};

module.exports = { showWebQuote };
