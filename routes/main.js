const router = require('express').Router();

router.get('/', (_, res) => {
	res.render('', { logged: false });
});

module.exports = router;
