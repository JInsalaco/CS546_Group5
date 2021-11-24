const router = require('express').Router();

router.get('/', (_, res) => {
	res.render('home', { title: 'The Pond', showHeader: true, scriptUrl: ['home.js'] });
});

module.exports = router;
