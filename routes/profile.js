const router = require('express').Router();
const { formidable } = require('formidable');
const fs = require('fs');
const userData = require('../data/users');
const { handleUserInfo } = require('../utils');

router.get('/', (req, res) => {
	// MODIFY uncomment this when project is finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permission');
	// 	return;
	// }
	res.render('profile', { title: 'Profile', showHeader: true, scriptUrl: ['profile.js'] });
});

router.post('/upload', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission');
		return;
	}

	const form = new formidable.IncomingForm();

	form.parse(req, async (err, _, files) => {
		if (err) {
			res.status(500).send('Internal Server Error');
			return;
		}

		try {
			const { newFilename, filepath, originalFilename } = files.avatar;
			const type = originalFilename.match(/\.\w+$/)[0];
			const fileName = `${newFilename}${type}`;
			fs.writeFileSync(`public/img/${fileName}`, fs.readFileSync(filepath));
			const path = `/public/img/${fileName}`;

			await userData.uploadPic(req.session.userid, path);
			res.json({ path });
		} catch (error) {
			res.status(500).send('Internal Server Error');
		}
	});
});

router.post('/edit', async (req, res) => {
	// MODIFY uncomment this when project is finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permission');
	// 	return;
	// }

	try {
		if (req.body) {
			let username = '',
				gender = '',
				DOB = '',
				bio = '';
			if (req.body.username && req.body.username.trim() !== '') username = req.body.username;
			if (req.body.bio && req.body.bio.trim() !== '') bio = req.body.bio;
			if (req.body.DOB && req.body.DOB.trim() !== '') DOB = req.body.DOB;
			if (req.body.gender && req.body.gender.trim() !== '') gender = req.body.gender;
			if (!req.body.firstname || req.body.firstname.trim() == '') throw 'Firstname is a required field';
			if (!req.body.lastname || req.body.lastname.trim() == '') throw 'Lastname is a required field';
			if (
				!req.body.phoneNumber ||
				req.body.phoneNumber.trim() == '' ||
				req.body.phoneNumber.search(/^\((\d{3})\)(\d{3})-(\d{4})$/) === -1
			)
				throw 'Phone number is a required field, please enter valid phone number';
			if (
				!req.body.email ||
				req.body.email.trim() == '' ||
				req.body.email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1
			)
				throw 'Email is a required field, please enter valid email';
			var newUser = await userData.editUser(
				req.session.userid,
				req.body.email,
				req.body.firstname,
				req.body.lastname,
				req.body.phoneNumber,
				gender,
				DOB,
				username,
				bio
			);

			const userInfo = handleUserInfo(newUser);
			if (newUser) res.json({ msg: 'Profile edited successfully', user: userInfo });
		} else throw 'Could not edit profile';
	} catch (error) {
		res.status(400).send(error?.message ?? error);
	}
});

//TODO: Finish Testing
router.post('/addFriend', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission');
		return;
	}

	try {
		const { email } = req.body;
		if (
			!email ||
			email.trim() == '' ||
			email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1
		)
			res.status(400).send('Email is a required field, please enter valid email');

		const friend = await userData.addFriend(req.session.userid, email);
		if (friend) res.status(200).send(`${friend.firstname} added as a friend!`)
		else res.status(404).send("Friend could not be added");
	} catch(e) {
		res.status(500).send('Internal Server Error');
	}
})

//TODO: Finish Testing
router.get('/friends', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission');
		return;
	}
	try {
		const friendList = await userData.getUserFriends(req.session.userid);
		if (friendList) res.status(200).send(friendList)
		else res.status(404).send("Friend list could not be retrieved");
	} catch(e) {
		res.status(500).send('Internal Server Error');
	}
})
module.exports = router;
