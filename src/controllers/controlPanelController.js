const path = require('path');

const showControlPanel = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/control-panel.html'));
};

module.exports = { showControlPanel };
