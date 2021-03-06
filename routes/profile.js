const router = require('express').Router();
const { formidable } = require('formidable');
const fs = require('fs');
const userData = require('../data/users');
const { handleUserInfo, errorCheckingId } = require('../utils');

router.get('/', (req, res) => {
	// MODIFY uncomment this when project is finished
	if (!req.session.userid) {
		res.status(403).redirect('/');
		return;
	}
	res.render('profile', { title: 'Profile', showHeader: true, scriptUrl: ['profile.js'] });
});

router.post('/upload', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission, please login first');
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
	if (!req.session.userid) {
		res.status(403).send('No permission, please login first');
		return;
	}

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
			const newUser = await userData.editUser(
				req.session.userid,
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

router.get('/searchFriend', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission, please login first');
		return;
	}

	const { email } = req.query;

	try {
		const friendList = await userData.searchFriendByEmail(email, req.session.userid);
		res.json(friendList);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

router.get('/userInfo', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission, please login first');
		return;
	}

	const { id } = req.query;
	try {
		errorCheckingId(id);
	} catch (error) {
		res.status(400).send(error?.message ?? error);
		return;
	}

	try {
		const userInfo = await userData.getUser(id, 0, 0, 0);
		res.json(userInfo);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.post('/addFriend', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission, please login first');
		return;
	}
	const { id } = req.body;
	try {
		errorCheckingId(id);
	} catch (error) {
		res.status(400).send(error?.message ?? error);
		return;
	}

	try {
		const { update: updateUser } = await userData.addFriend(req.session.userid, id);
		const { update: updateFriend } = await userData.addFriend(id, req.session.userid);
		if (!updateUser || !updateFriend) throw 'Cannot add friend';

		res.status(200).send(true);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.get('/friends', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission, please login first');
		return;
	}
	try {
		const friendList = await userData.getUserFriends(req.session.userid);
		res.json(friendList);
	} catch (e) {
		res.status(500).send('Internal Server Error');
	}
});

module.exports = router;
