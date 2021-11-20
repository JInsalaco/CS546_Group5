const router = require('express').Router();

router.get('/', (_, res) => {
	res.render('home', { title: 'The Pond', logged: false });
});

module.exports = router;
