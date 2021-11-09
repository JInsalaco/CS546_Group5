const router = require('express').Router();

router.get('/', (_, res) => {
	res.render('home', { logged: false });
});

module.exports = router;
