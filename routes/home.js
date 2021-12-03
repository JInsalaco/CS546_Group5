const router = require('express').Router();

router.get('/', (_, res) => {
	res.render('home', { title: 'The Pond', showHeader: true, showSeatcdInput: true, scriptUrl: ['home.js'] });
});

router.get('/logout', async (req, res) => {
	req.session.destroy();
	res.clearCookie('AuthCookie');
	res.status(200).send('You have logged out');
});

module.exports = router;
