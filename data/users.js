const { users } = require('../config/mongoCollections');
const User = require('../utils/collections/User');
const { toObjectId } = require('../utils/utils');

module.exports = {
	async addUser(obj) {
		const userCollection = await users();
		// check if the user already exists
		const userInfo = await this.getUser(obj);
		if (userInfo) throw 'The email was occupied by other user, pleace change another email!';

		const newInsertInformation = await userCollection.insertOne(new User(obj));
		if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
		return 'Inserted successfully!';
	},

	async getUser({ id, email }) {
		const userCollection = await users();
		const params = id ? { email, _id: toObjectId(id) } : { email };
		const userInfo = await userCollection.findOne(params);
		return userInfo;
	}
};
