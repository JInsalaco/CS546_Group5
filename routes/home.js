const router = require('express').Router();

router.get('/', (_, res) => {
	res.render('home', { title: 'The Pond', logged: true });
});

module.exports = router;
