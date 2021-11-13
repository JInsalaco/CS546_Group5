const router = require('express').Router();
const data = require('../data');
const userData = data.users;

router.get('/:type', (req, res) => {
	const { type } = req.params;
	const actions = `Sign ${type.match(/^sign(\S+)$/)[1]}`;
	res.render('authorize', { title: actions, isSignIn: type === 'signin' });
});

router.post('/signup', async (req, res) => {
	let userInfo = req.body;

	try {
		const newUser = await userData.addUser(userInfo);
		res.json(newUser);
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
