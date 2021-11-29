const express = require('express');
const router = express.Router();
const userData = require('../data/users');

router.get('/:type', (req, res) => {
	const { type } = req.params;
	const actions = `Sign ${type.match(/^sign(\S+)$/)[1]}`;
	res.render('authorize', { title: actions, isSignIn: type === 'signin', scriptUrl: [`authorize/${type}.js`] });
});

router.post('/signup', async (req, res) => {
	try {
		let userInfo = req.body;
		let firstname = userInfo.firstname;
		let lastname = userInfo.lastname;
		let email = userInfo.email;
		let phoneNumber = userInfo.phoneNumber;
		let password = userInfo.password;
		userData.checkUserData(email, password, firstname, lastname, phoneNumber);
		var newUser = await userData.addUser(email, password, firstname, lastname, phoneNumber);
		if (newUser) res.status(200).send('Signed up successfully'); //Need to redirect here to private session/home login
	} catch (e) {
		res.status(400).send(e); //need to render
	}
});

router.post('/signin', async (req, res) => {
	try {
		let email = req.body.email;
		let password = req.body.password;
		if (!email || !password) throw 'You must supply both username and password';
		if (email === ' ' || password === ' ') throw 'You must supply valid username or password';
		if (!(typeof email === 'string') || !(typeof password === 'string'))
			throw 'You must supply valid username or password';
		if (email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1) throw 'You must supply valid username or password';
		if (password.length < 8 || password.length > 15) throw 'You must supply valid username or password';
		let user = await userData.authenticateUser(email, password);
		if (user) {
			res.json({
				id: user.user._id,
				username: user.user.userName,
				firstname: user.user.firstname,
				lastname: user.user.lastname,
				profilePic: user.user.profilePic,
				phoneNumber: user.user.phoneNumber,
				email: user.user.email
			});
		}
	} catch (e) {
		res.status(400).send(e); //need to render
	}
});


module.exports = router;
