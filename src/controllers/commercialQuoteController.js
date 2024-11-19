const path = require('path');

const showCommercialQuote = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/commercial-quote.html'));
};

module.exports = { showCommercialQuote };
