import {
	ADD_POST,
	SET_FEED,
	SET_POST,
	SET_REP_COUNT,
	SET_POST_COMMENTS,
	ADD_COMMENT,
	SET_NOTIFICATIONS,
	REMOVE_NOTIFICATION
} from '../actions/home'

import {
	SET_LOGGED_OUT,
} from '../actions/profile'
import Comments from '../comments'

const initialState = {
	feed: {},
	notifications: {},
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_FEED: {
			return {
				...state,
				feed: {...state.feed, ...action.feed}
			}
		}
		case ADD_POST:
			return {
				...state,
				feed: {...state.feed, [action.id]: action.post}
			}
		case SET_POST:
			return {
				...state,
				feed: {...state.feed, [action.post.key]: action.post },
			}
		case SET_POST_COMMENTS: {
			return {
				...state,
				feed: {...state.feed, [action.post]: {...state.feed[action.post], comments: action.comments, commentCount: action.comments.length }},
			}
		}
		case ADD_COMMENT: {
			return {
				...state,
				feed: {...state.feed, [action.post]: {...state.feed[action.post], commentCount: action.count, 
					comments: [...state.feed[action.post].comments, action.comment]}},
			}
		}
		case SET_NOTIFICATIONS: {
			return {
				...state,
				notifications: action.notifications
			}
		}
		case SET_LOGGED_OUT: {
			return initialState
		}
		default:
			return state
	}
}

const getCommentCount = (post, increment) => {
	if (increment) {
		if (post.commentCount) {
			return post.commentCount + 1
		}
		else return 1
	}
	else return post.commentCount || 0
}