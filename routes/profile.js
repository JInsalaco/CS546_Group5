const router = require('express').Router();
const { formidable } = require('formidable');
const fs = require('fs');

router.get('/', (_, res) => {
	res.render('profile', { title: 'Profile', showHeader: true, scriptUrl: ['profile.js'] });
});

router.post('/upload', (req, res) => {
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
			// TODO: store the path to MongoDB
			res.json({ path });
		} catch (error) {
			res.status(500).send('Internal Server Error');
		}
	});
});

module.exports = router;
