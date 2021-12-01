const { communities } = require('../config/mongoCollections');
const utils = require('./utils');

async function createCommunity(title,description,owner){
    //TODO: Error Checking
    const communitiesList = await communities();
    const dateCreated = new Date();

    const newCommunity =
    {
        title: title,
        description: description,
        owner: owner,
        members: [],
        usersWhoCanPost: [],
        posts: [],
        metadata:
            {
                active: true,
                dateCreated: dateCreated
            }
    }

    const insertInfo = await communitiesList.insertOne(newCommunity);
    if (insertInfo.insertedCount === 0) throw "Error: Could not add topic";

    return insertInfo;
}
async function deleteCommunity(id){
    //TODO: Error Checking
    let oid = utils.stringToObjectID(id);
    const communitiesList = await communities();
    const deletedCommunity = await communitiesList.findOne({_id: oid});
    if(!deletedCommunity) throw "Error: Community DNE";

    const deletionInfo = await communitiesList.deleteOne({_id: oid});
    if (deletionInfo.deletedCount === 0) { throw `Could not delete topic`; }
    return { deleted: true };

}
async function getAllCommunities(){
    //TODO: Testing
    const communitiesList = await communities();
    const communities = communitiesList.find({}).toArray();
    return communities;
}
async function joinCommunity(communityId,memberId){
    //TODO: Error Checking
    let oid = utils.stringToObjectID(communityId);
    const communitiesList = await communities();
    const joinedCommunity = await communitiesList.findOne({_id: oid});
    let membersList = joinedCommunity.members;
    let newMembersList = membersList.push(memberId);
    const newInsertInformation = await communitiesList.updateOne({ _id: oid },
		{$set: 
			{members: newMembersList}
		});
	if(newInsertInformation.modifiedCount === 0) throw "Error: Could not add friend";
	return newInsertInformation;
}
async function leaveCommunity(communityId,memberId){
    //TODO: Implement function
    let oid = utils.stringToObjectID(memberId)
    const communitiesList = await communities();
}
module.exports = {
    createCommunity,
    deleteCommunity,
    getAllCommunities,
    joinCommunity
}