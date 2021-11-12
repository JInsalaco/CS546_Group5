const router = require('express').Router();

router.get('/create', (_, res) => {
	res.render('posts/create');
});

module.exports = router;
