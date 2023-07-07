
const mainController = {};

mainController.get = (req, res) => {
    return res.json({
        data: 'This is a full stack app!'
    });
};

module.exports = mainController;