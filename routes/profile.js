const router = require('express').Router();
const { formidable } = require('formidable');
const fs = require('fs');
const userData = require('../data/users');
router.get('/', (_, res) => {
	res.render('profile', { title: 'Profile', showHeader: true, scriptUrl: ['profile.js'] });
});

router.post('/upload', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send();
		return;
	}

	const form = new formidable.IncomingForm();

	form.parse(req, (err, _, files) => {
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
			(async function () {
				try {
					const editUser = await userData.uploadPic(req.session.userid, path);
				} catch (e) {
					res.status(400).send(e);
				}
			})();

			res.json({ path });
			// TODO: store the path to MongoDB
		} catch (error) {
			res.status(500).send('Internal Server Error');
		}
	});
});
router.post('/edit', async (req, res) => {
	try{
	if(req.body){
	let username = "", gender="", DOB="", profilePic="", bio = "";
	if(req.body.username && req.body.username.trim() !== "")
		username = req.body.username;
	if(req.body.bio && req.body.bio.trim() !== "")
		bio = req.body.bio;
	if(req.body.DOB && req.body.DOB.trim() !== "")
		DOB = req.body.DOB;
	if(req.body.gender && req.body.gender.trim() !== "")
		gender = req.body.gender;
	// if(req.body.profilePic && req.body.profilePic.trim() !== "")
	// 	profilePic = req.body.profilePic;
	if(!req.body.firstname || req.body.firstname.trim() == "")
		throw "firstname is a required field";
	if(!req.body.lastname || req.body.lastname.trim() == "")
		throw "lastname is a required field";
	if(!req.body.phoneNumber || req.body.phoneNumber.trim() == "" || req.body.phoneNumber.search(/^\((\d{3})\)(\d{3})-(\d{4})$/) === -1)
		throw "phone number is a required field, please enter valid phone number";
	if(!req.body.email || req.body.email.trim() == "" || req.body.email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1)
		throw "email is a required field, please enter valid email";
	var newUser = await userData.editUser(req.session.userid, req.body.email, req.body.firstname, req.body.lastname, req.body.phoneNumber, gender, DOB, username, bio);
	if (newUser) res.status(200).send('Profile edited successfully');
	}
	else
		throw "Could not edit profile";
}catch(e){
	res.status(400).send(e);
}	

	
});
module.exports = router;
