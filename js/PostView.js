import React, { Component } from "react"
import {
    Container
} from 'native-base'
import {
    View
} from 'react-native'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import firebase from 'react-native-firebase'
import colors from './constants/colors'
import TouchableOpacity from './constants/TouchableOpacityLockable'

const weightUp = require('Anyone/assets/images/weightlifting_up.png')
const weightDown = require('Anyone/assets/images/weightlifting_down.png')

class PostView extends Component {
    
    constructor(props) {
        super(props)
    }
    render() {

    }
}


const mapStateToProps = ({ profile, home, friends, sharedInfo }) => ({
  profile: profile.profile,
  feed: home.feed,
  friends: friends.friends,
  users: sharedInfo.users,
})

const mapDispatchToProps = dispatch => ({
  goToProfile: () => dispatch(navigateProfile()),
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  onRepPost: (item) => dispatch(repPost(item)),
  comment: (uid, postId, text, created_at, parentCommentId) => dispatch(postComment(uid, postId, text, created_at, parentCommentId)),
  getComments: (key) => dispatch(fetchComments(key)),
  repComment: (comment) => dispatch(repComment(comment)),
})

export default connect(mapStateToProps, mapDispatchToProps) (PostView)