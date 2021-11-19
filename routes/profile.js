const router = require('express').Router();

router.get('/:part', (req, res) => {
	res.render('profile', { title: 'Profile' });
});

module.exports = router;
