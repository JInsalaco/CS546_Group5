const { ObjectId } = require('mongodb');

// Funciton that checks if the id provided passes error checking
// Returns an ObjectId in order to perform MongoDB query
function stringToObjectID(id) {
    if (!id) { throw 'Id parameter must be supplied'; }
    if (typeof id !== 'string') { throw "Id must be a string"; }
    else if (id.trim() === "") { throw "Id is an empty string"; }
    if (!(ObjectId.isValid(id))) { throw "Id is not a valid ObjectID"; }
    return ObjectId(id);
}

// Function that takes a list of collections and changes their
// ObjectIds into strings. Useful for when responding to requests
function objectIdToString(id){

    if (Array.isArray(id)) {
        for (let i = 0; i < id.length; i++) {
            coll = id[i];
            coll._id = coll._id.toString();
        }
        return id;
    }
    return id.toString();
}

module.exports = {
    stringToObjectID,
    objectIdToString
}