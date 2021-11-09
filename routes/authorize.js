const router = require('express').Router();

router.get('/:type', (req, res) => {
	const type = req.params.type.match(/^sign(\S+)$/)[1];
	res.render('authorize', { action: `Sign ${type}` });
});

module.exports = router;
