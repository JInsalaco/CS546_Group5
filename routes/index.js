const main = require('./main');
const authorize = require('./authorize');

module.exports = app => {
	app.use('/', main);
	app.use('/authorize', authorize);

	app.use('*', (_, res) => {
		res.status(404).json({ error: 'No APIs' });
	});
};
