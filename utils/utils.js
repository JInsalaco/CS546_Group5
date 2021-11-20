const { ObjectId } = require('bson');

const toObjectId = id => {
	if (!id) throw 'You must provid id.';
	if (id instanceof ObjectId) {
		return id;
	}
	if (!stringChecker(id)) throw 'Id is not a string or it is an empty string.';

	try {
		return ObjectId(id);
	} catch (error) {
		throw 'Invaild id';
	}
};

module.exports = {
	toObjectId
};
