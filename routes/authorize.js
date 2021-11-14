const router = require('express').Router();
const data = require('../data');
const userData = data.users;

router.get('/:type', (req, res) => {
	const { type } = req.params;
	const actions = `Sign ${type.match(/^sign(\S+)$/)[1]}`;
	res.render('authorize', { title: actions, isSignIn: type === 'signin' });
});

router.post('/signup', async (req, res) => {
	const userInfo = req.body;

	try {
		const result = await userData.addUser(userInfo);
		res.json(result);
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
