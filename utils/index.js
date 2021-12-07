const { ObjectId } = require('bson');

function errorCheckingId(id) {
	if (!id) throw 'The id is not provided';
	if (typeof id !== 'string' || id.trim() === '') throw 'The id is not a string or is an empty string';
	if (!ObjectId.isValid(id)) throw 'The id is invalid';
}

// Funciton that checks if the id provided passes error checking
// Returns an ObjectId in order to perform MongoDB query
function stringToObjectID(id) {
	if (Array.isArray(id)) {
		let objectList = [];
		for (let i = 0; i < id.length; i++) {
			let element = id[i];
			if (!element) {
				throw 'Id parameter must be supplied';
			}
			if (typeof element !== 'string') {
				throw 'Id must be a string';
			} else if (element.trim() === '') {
				throw 'Id is an empty string';
			}
			if (!ObjectId.isValid(element)) {
				throw 'Id is not a valid ObjectID';
			}
			objectList.push(ObjectId(element));
		}
		return objectList;
	}
	if (!id) {
		throw 'Id parameter must be supplied';
	}
	if (typeof id !== 'string') {
		throw 'Id must be a string';
	} else if (id.trim() === '') {
		throw 'Id is an empty string';
	}
	if (!ObjectId.isValid(id)) {
		throw 'Id is not a valid ObjectID';
	}
	return ObjectId(id);
}

function objectIdToString(id) {
	if (Array.isArray(id)) {
		return id.map(item => {
			item._id = item?._id.toString();
			return item;
		});
	}
	return id.toString();
}

const handleUserInfo = userInfo => {
	const props = ['firstname', 'lastname', 'phoneNumber', 'email', 'gender', 'DOB', 'username', 'bio', 'profilePic'];
	return props.reduce((pre, cur) => {
		pre[cur] = userInfo[cur];
		return pre;
	}, {});
};

module.exports = {
	errorCheckingId,
	stringToObjectID,
	objectIdToString,
	handleUserInfo
};
