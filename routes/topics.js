const router = require('express').Router();
const {
	topics: { getAllTopics }
} = require('../data');

router.get('/getAll', async (_, res) => {
	let allTopics;
	try {
		allTopics = await getAllTopics();
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}

	if (allTopics) {
		res.json(allTopics);
	} else {
		res.status(404).send('Topics not found');
	}
});

module.exports = router;
