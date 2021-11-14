const router = require('express').Router();
const {
	posts: { addPost }
} = require('../data');

router.post('/add', async (req, res) => {
	const postContent = req.body;
	try {
		const result = await addPost(postContent);
		res.json(result);
	} catch (error) {
		res.status(500).send(error);
	}
});

// TODO: add id after url '/detail/:id'
router.get('/detail', (_, res) => {
	res.render('post');
});

module.exports = router;
