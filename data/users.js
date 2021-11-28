//const { users } = require('../config/mongoCollections');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const utils = require('./utils');
const bcrypt = require('bcrypt');
const saltRounds = 16;
const { ObjectId } = require('mongodb');

function checkUserData(email, password, firstname, lastname, phoneNumber, gender, DOB, userName, bio) {
	if (!email) throw "Email parameter is missing"
	if (!password) throw "Password parameter is missing"
	if (!firstname) throw "First name parameter is missing"
	if (!lastname) throw "Last name parameter is missing"
	if (!phoneNumber) throw "Phone number parameter is missing"

	if (typeof email !== 'string') throw "Email is invalid"
	else if (email.trim() === "") throw "Email is empty spaces";
	if (typeof password !== 'string') throw "Password is invalid"
	else if (password.trim() === "") throw "Password is empty spaces";
	if (typeof firstname !== 'string') throw "First name is invalid"
	else if (firstname.trim() === "") throw "First name is empty spaces";
	if (typeof lastname !== 'string') throw "Last name is invalid"
	else if (lastname.trim() === "") throw "Last name is empty spaces";
	if (typeof phoneNumber !== 'string') throw "Phone number is invalid"
	else if (phoneNumber.trim() === "") throw "Phone number is empty spaces";

	if (email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1) throw 'Please enter your stevens.edu id for signing up';
	if (password.length < 8 || password.length > 15) throw 'Your Password should have min 8 to maximum 15 characters';
	if (password.search(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}/) === -1)
		throw 'Your password must contain the following: at least one number, one uppercase letter, one lowercase letter, 8 or more characters';
	if (phoneNumber.search(/^\((\d{3})\)(\d{3})-(\d{4})$/) === -1)
		throw 'Phone number must be in the following format: (XXX)XXX-XXXX';

	if (gender) {
		if (gender.search(/(?=.*[a-z])(?=.*[A-Z])/) === -1) throw "Only upper and lowercase letters allowed";
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
		userName: '',
		bio: '',
		profilePic: '/public/img/default.png',
		posts: [],
		threads: [],
		friends: [],
		anonymous: false
	};
	const newInsertInformation = await userCollection.insertOne(newUser);
	if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
	return newUser;
}
async function authenticateUser(email, password) {
	if (!email || !password) throw 'You must supply both username and password';
	if (typeof email !== 'string') throw "Email is invalid"
	else if (email.trim() === "") throw "Email is empty spaces";
	if (typeof password !== 'string') throw "Password is invalid"
	else if (password.trim() === "") throw "Password is empty spaces";


	if (email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1) throw 'You must supply valid username or password';
	if (password.length < 8 || password.length > 15) throw 'Password must be between 8 and 15 characters';
	email = email.toLowerCase();
	const userCollection = await users();
	const user = await userCollection.findOne({ email: email });
	if (user) {
		let match = await bcrypt.compare(password, user.hashedPwd);
		if (match) {
			return { authenticated: true, user: user };
		}
	}
	throw 'Invalid username or password';
}

/*
* Appends user ID to friends list
*/
async function addFriend(userId, friendId){
	const userCollection = await users();
	const user = await userCollection.findOne({ _id: userId });
	let friendsList = user.friends;
	let updatedFriendsList = friendsList.push(friendId);
	const newInsertInformation = await userCollection.updateOne({ _id: id },
		{$set: 
			{friends: updatedFriendsList}
		});
	if(newInsertInformation.modifiedCount === 0) throw "Error: Could not add friend";
	return newInsertInformation;
}

async function getUserFriends(id) {
	const user = await getUser(id);
	let friendList = [];

	for (let i = 0; i < user.friends.length; i++) {
		let friend = await getUser(user.friends[i]);
	}
	return
}

async function getAllUserPosts(id) {
	// Find the user whose posts will be returned
	const user = await getUser(id);
	return user.posts;
}

async function getUser(id) {
	let oid = utils.stringToObjectID(id);
	const userCollection = await users();
	const user = await userCollection.findOne({ _id: oid });
	if (user === null) throw "Post not found";
	utils.objectIdToString(oid);

	return user;
}

async function getAllUsers() {
	const userCollection = await users();
    const usersList = await userCollection.find({}).toArray();
    objectIdToString(usersList);

    return usersList;
}

// Remove a restaurant
async function deleteUser(id) {
    const sid = utils.objectIdToString(id);
    const user = await this.getUser(sid);
	const userCollection = await users();
    const deletionInfo = await userCollection.deleteOne({ _id: id });

    // Check that the deletion was completed in MongoDB
    if (deletionInfo.deletedCount === 0) { throw `Could not delete user ${user.userName}`; }
    return user;
}

async function editUser(id, email, password, firstname, lastname, phoneNumber, gender, DOB, userName, bio) {
	checkUserData(email, password, firstname, lastname, phoneNumber, gender, DOB, userName, bio);
	const sid = utils.objectIdToString(id)
	const user = await this.getUser(sid);

	let newUser = {
		firstname: firstname,
		lastname: lastname,
		phoneNumber: phoneNumber,
		email: email,
		hashedPwd: user.hashedPwd,
		gender: gender,
		DOB: DOB,
		userName: userName,
		bio: bio,
		profilePic: '/public/img/default.png',
		posts: user.posts,
		threads: user.threads,
		friends: user.friends,
		anonymous: false
	}

	const checkUser = equalUser(user, newUser);
	if (!checkUser) throw 'No changes made to the post'; 

	const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: id },
      { $set: newUser }
    );

    // Check if the update was made in MongoDB
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) { throw 'Update failed'; }

    return await this.getUser(sid);
}

async function updateUser(user, userId) {
	const oid = utils.stringToObjectID(userId)
	const userCollection = await users();
	const updateInfo = await userCollection.updateOne(
		{ _id: oid },
		{ $set: user }
	);

	if (!updateInfo.matchedCount && !updateInfo.modifiedCount) { throw 'Update failed'; }

	let sid = utils.objectIdToString(oid);
    return await this.getUser(sid);
}

function equalUser(user1, user2) {
	if (user1.firstname === user2.firstname &&
		user1.lastname === user2.lastname &&
		user1.phoneNumber === user2.phoneNumber &&
		user1.email === user2.email &&
		user1.hashedPwd === user2.hashedPwd &&
		user1.gender === user2.gender &&
		user1.DOB === user2.DOB &&
		user1.profilePic === user2.profilePic &&
		user1.profilePic === user2.profilePic) {
			let postsFlag, threadsFlag, friendsFlag = false;

			if (user1.posts.length !== user2.posts.length) return false;
            let postList1 = sort(user1.posts);
            let postList2 = sort(user2.posts);

			for (let i = 0; i < postList1.length; i++) {
                if (postList1[i] !== postList2[i]) {
                    postsFlag = true;
                }
            }

			if (postsFlag) return false;

			if (user1.threads.length !== user2.threads.length) return false;
            let tList1 = sort(user1.threads);
            let tList2 = sort(user2.threads);

			for (let i = 0; i < tList1.length; i++) {
                if (tList1[i] !== tList2[i]) {
                    threadsFlag = true;
                }
            }

			if (threadsFlag) return false;

			if (user1.friends.length !== user2.friends.length) return false;
            let friendList1 = sort(user1.friends);
            let friendsList2 = sort(user2.friends);

			for (let i = 0; i < friendList1.length; i++) {
                if (friendList1[i] !== friendsList2[i]) {
                    friendsFlag = true;
                }
            }

			if (friendsFlag) return false;

	}

	return true;

}

module.exports = {
	addUser,
	checkUserData,
	authenticateUser,
	addFriend,
	getUser,
	updateUser,
	getUserFriends,
	getAllUserPosts,
	getAllUsers,
	editUser,
	deleteUser
};
