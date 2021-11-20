const router = require('express').Router();
const { formidable } = require('formidable');
const fs = require('fs');

router.get('/:part', (_, res) => {
	res.render('profile', { title: 'Profile' });
});

router.post('/upload', (req, res) => {
	const form = new formidable.IncomingForm();

	form.parse(req, (err, fields, files) => {
		if (err) return;

		try {
			const { newFilename, filepath, originalFilename } = files.avatar;
			const type = originalFilename.match(/\.\w+$/)[0];
			const fileName = `${newFilename}${type}`;
			fs.writeFileSync(`public/img/${fileName}`, fs.readFileSync(filepath));
			res.json({ path: `/public/img/${fileName}` });
		} catch (error) {
			res.status(500).send('Interval Error.');
		}
	});
});

module.exports = router;
