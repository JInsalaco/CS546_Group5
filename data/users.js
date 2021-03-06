const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const utils = require('../utils/index');
const bcrypt = require('bcrypt');
const saltRounds = 16;
const { ObjectId } = require('mongodb');

function checkUserData(email, password, firstname, lastname, phoneNumber, gender, DOB, username, bio) {
	if (!email) throw 'Email parameter is missing';
	if (!password) throw 'Password parameter is missing';
	if (!firstname) throw 'First name parameter is missing';
	if (!lastname) throw 'Last name parameter is missing';
	if (!phoneNumber) throw 'Phone number parameter is missing';

	if (typeof email !== 'string') throw 'Email is invalid';
	else if (email.trim() === '') throw 'Email is empty spaces';
	if (typeof password !== 'string') throw 'Password is invalid';
	else if (password.trim() === '') throw 'Password is empty spaces';
	if (typeof firstname !== 'string') throw 'First name is invalid';
	else if (firstname.trim() === '') throw 'First name is empty spaces';
	if (typeof lastname !== 'string') throw 'Last name is invalid';
	else if (lastname.trim() === '') throw 'Last name is empty spaces';
	if (typeof phoneNumber !== 'string') throw 'Phone number is invalid';
	else if (phoneNumber.trim() === '') throw 'Phone number is empty spaces';

	if (email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1) throw 'Please enter your stevens.edu id for signing up';
	if (password.length < 8 || password.length > 15) throw 'Your Password should have min 8 to maximum 15 characters';
	if (password.search(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}/) === -1)
		throw 'Your password must contain the following: at least one number, one uppercase letter, one lowercase letter, 8 or more characters';
	if (phoneNumber.search(/^\((\d{3})\)(\d{3})-(\d{4})$/) === -1)
		throw 'Phone number must be in the following format: (XXX)XXX-XXXX';

	if (gender) {
		if (gender.search(/(?=.*[a-z])(?=.*[A-Z])/) === -1) throw 'Only upper and lowercase letters allowed';
	}
}

// Still able to create a username with the same email
async function addUser(email, password, firstname, lastname, phoneNumber) {
	checkUserData(email, password, firstname, lastname, phoneNumber);
	const userCollection = await users();
	email = email.toLowerCase();
	const user = await userCollection.findOne({ email: email });
	if (user) {
		throw 'User exists with this email, please sign-up with a different email';
	}
	const hashPassword = await bcrypt.hash(password, saltRounds);

	let newUser = {
		firstname: firstname,
		lastname: lastname,
		phoneNumber: phoneNumber,
		email: email,
		hashedPwd: hashPassword,
		gender: '',
		DOB: '',
		username: '',
		bio: '',
		profilePic: '/public/img/default.png',
		posts: [],
		thread: [],
		friends: [],
		anonymous: false
	};

	const newInsertInformation = await userCollection.insertOne(newUser);
	if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
	return newUser;
}

async function authenticateUser(email, password) {
	if (!email || !password) throw 'You must supply both username and password';
	if (typeof email !== 'string') throw 'Email is invalid';
	else if (email.trim() === '') throw 'Email is empty spaces';
	if (typeof password !== 'string') throw 'Password is invalid';
	else if (password.trim() === '') throw 'Password is empty spaces';

	if (email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1) throw 'You must supply valid username or password';
	if (password.length < 8 || password.length > 15) throw 'Password must be between 8 and 15 characters';
	email = email.toLowerCase();

	const userCollection = await users();
	const user = await userCollection.findOne({ email });
	if (user) {
		let match = await bcrypt.compare(password, user.hashedPwd);
		if (match) {
			return { authenticated: true, user };
		}
	}
	throw 'Invalid username or password';
}

/*
 * Appends user ID to friends list
 */
async function addFriend(userId, friendId) {
	const { friends } = await getUser(userId);
	friends.push(friendId);

	const userCollection = await users();
	const updateInfo = await userCollection.updateOne({ _id: utils.stringToObjectID(userId) }, { $set: { friends } });
	if (updateInfo.modifiedCount === 0) throw 'Could not update friends';

	return { update: true };
}

async function getUserFriends(userId) {
	const { friends } = await getUser(userId);
	const friendsIds = friends.map(item => utils.stringToObjectID(item));

	const userCollection = await users();
	const friendList = await userCollection
		.find(
			{ _id: { $in: friendsIds } },
			{ projection: { _id: 1, firstname: 1, lastname: 1, username: 1, profilePic: 1, email: 1 } }
		)
		.toArray();

	return friendList;
}

async function getUser(id, thread = 1, posts = 1, friends = 1) {
	let oid = utils.stringToObjectID(id);
	const userCollection = await users();
	const projection = { hashedPwd: 0 };
	thread === 0 && (projection['thread'] = 0);
	posts === 0 && (projection['posts'] = 0);
	friends === 0 && (projection['friends'] = 0);
	const user = await userCollection.findOne({ _id: oid }, { projection });
	if (user === null) throw 'User not found';
	user._id = utils.objectIdToString(user._id);

	return user;
}

async function getAllUsers() {
	const userCollection = await users();
	const usersList = await userCollection.find({}).toArray();

	return utils.objectIdToString(usersList);
}

// Remove a restaurant
async function deleteUser(id) {
	const sid = utils.objectIdToString(id);
	const user = await this.getUser(sid);
	if (user === null) throw 'User does not exist';
	const userCollection = await users();
	const deletionInfo = await userCollection.deleteOne({ _id: id });

	// Check that the deletion was completed in MongoDB
	if (deletionInfo.deletedCount === 0) {
		throw `Could not delete user ${user.username}`;
	}
	return user;
}
async function uploadPic(id, path) {
	if (!path || path.trim() === '' || typeof path !== 'string') throw 'invalid path';
	if (!id || id.trim() === '') throw 'user not found';
	const userCollection = await users();
	const updateInfo = await userCollection.updateOne({ _id: ObjectId(id) }, { $set: { profilePic: path } });
	if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
		throw 'Upload failed';
	}
	return true;
}

async function editUser(id, firstname, lastname, phoneNumber, gender, DOB, username, bio) {
	// checkUserData(email, password, firstname, lastname, phoneNumber, gender, DOB, username, bio);
	const sid = utils.objectIdToString(id);
	const user = await this.getUser(sid);

	let newUser = {
		firstname,
		lastname,
		phoneNumber,
		gender,
		DOB,
		username,
		bio,
		anonymous: false
	};

	const checkUser = equalUser(user, newUser);
	if (checkUser) throw 'No changes made to the user profile';

	const userCollection = await users();
	const updateInfo = await userCollection.updateOne({ _id: utils.stringToObjectID(id) }, { $set: newUser });

	// Check if the update was made in MongoDB
	if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
		throw 'Update failed';
	}

	const userInfo = await getUser(id);

	return userInfo;
}

async function updateUser(user, userId) {
	const oid = utils.stringToObjectID(userId);
	const userCollection = await users();
	user._id = oid;
	const updateInfo = await userCollection.updateOne({ _id: oid }, { $set: user });

	if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
		throw 'Update failed';
	}

	let sid = utils.objectIdToString(oid);
	return await this.getUser(sid);
}

function equalUser(user1, user2) {
	if (
		user1.firstname === user2.firstname &&
		user1.lastname === user2.lastname &&
		user1.phoneNumber === user2.phoneNumber &&
		user1.gender === user2.gender &&
		user1.DOB === user2.DOB &&
		user1.username === user2.username &&
		user1.bio === user2.bio
	) {
		return true;
	}

	return false;
}

const updateThread = async (userId, threadId) => {
	const { thread } = await getUser(userId);
	thread.push(utils.objectIdToString(threadId));

	const userCollection = await users();
	const updateInfo = await userCollection.updateOne({ _id: utils.stringToObjectID(userId) }, { $set: { thread } });
	if (updateInfo.modifiedCount === 0) throw 'Could not update popularity';
	return { update: true };
};

const searchFriendByEmail = async (email, userid) => {
	const userCollection = await users();
	const list = await userCollection
		.find(
			{ email: RegExp(`.*${email}.*@stevens.edu`) },
			{ projection: { _id: 1, username: 1, firstname: 1, lastname: 1, email: 1 } }
		)
		.toArray();

	const friendList = utils.objectIdToString(list);
	const index = friendList.findIndex(item => item._id === userid);
	if (index !== -1) {
		friendList.splice(index, 1);
	}

	return friendList;
};

module.exports = {
	addUser,
	checkUserData,
	authenticateUser,
	addFriend,
	getUser,
	updateUser,
	getUserFriends,
	getAllUsers,
	editUser,
	deleteUser,
	uploadPic,
	updateThread,
	searchFriendByEmail
};
