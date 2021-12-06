const express = require('express');
const router = express.Router();
const userData = require('../data/users');
const { handleUserInfo } = require('../utils');

router.get('/:type', (req, res) => {
	try {
		if (!req.session.user) {
			const { type } = req.params;
			const actions = `Sign ${type.match(/^sign(\S+)$/)[1]}`;
			res.render('authorize', { title: actions, isSignIn: type === 'signin', scriptUrl: [`authorize/${type}.js`] });
		} else {
			res.render('home', { title: 'The Pond', showHeader: true, scriptUrl: ['home.js'] });
		}
	} catch (error) {
		return res.status(500).send(error?.message ?? error);
	}
});

router.post('/signup', async (req, res) => {
	try {
		const { firstname, lastname, email, phoneNumber, password } = req.body;
		userData.checkUserData(email, password, firstname, lastname, phoneNumber);
		var newUser = await userData.addUser(email, password, firstname, lastname, phoneNumber);
		if (newUser) res.status(200).send('Signed up successfully');
	} catch (e) {
		res.status(400).send(e);
	}
});

router.post('/signin', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) throw 'You must supply both username and password';
		if (email === ' ' || password === ' ') throw 'You must supply valid username or password';
		if (!(typeof email === 'string') || !(typeof password === 'string'))
			throw 'You must supply valid username or password';
		if (email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1) throw 'You must supply valid username or password';
		if (password.length < 8 || password.length > 15) throw 'You must supply valid username or password';

		const { authenticated, user } = await userData.authenticateUser(email, password);
		if (authenticated) {
			req.session.userid = user._id;

			const userInfo = handleUserInfo(user);
			res.json(userInfo);
		}
	} catch (e) {
		res.status(400).send(e); //need to render
	}
});

module.exports = router;
