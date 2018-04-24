import * as firebase from "firebase"

export const fanoutPost = (item) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		let uids = getState().friends.friends.map(friend => friend.uid)
		
	}
}