const router = require('express').Router();

// TODO: add id after url '/detail/:id'
router.get('/detail', (_, res) => {
	res.render('post');
});

module.exports = router;
