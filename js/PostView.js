import React, { Component } from "react"
import {
    Container,
    Header,
    Left,
    Icon,
    Spinner
} from 'native-base'
import {
    View,
    ScrollView,
} from 'react-native'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import firebase from 'react-native-firebase'
import colors from './constants/colors'
import TouchableOpacity from './constants/TouchableOpacityLockable'
import Comments from './comments'
import sStyles from './styles/settingsStyles'
import {
    extractCreatedTime,
    extractUsername,
    extractBody,
    likesExtractor,
    likeExtractor,
    extractChildrenCount,
    extractEditTime,
    extractImage,
    reportedExtractor,
  } from './constants/utils'
  import styles from './styles/postViewStyles'

const weightUp = require('Anyone/assets/images/weightlifting_up.png')
const weightDown = require('Anyone/assets/images/weightlifting_down.png')

class PostView extends Component {

    static navigationOptions = {
        header: null,
      }
    
    constructor(props) {
        super(props)
        this.params = this.props.navigation.state.params
        this.postId = this.params.postId

        this.state = {
            comments: [],
            post: {},
            commentFetchAmount: 10
        }
    }

    componentDidMount() {
        this.props.getComments(this.postId)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.feed && nextProps.feed[this.postId] && nextProps.feed[this.postId].comments) {
            this.setState({comments: nextProps.feed[this.postId].comments})
            this.setState({post: nextProps.feed[this.postId]})
        }
    }

    render() {
        return(
            <Container>
                <Header style={{backgroundColor: colors.primary}}>
                    <Left style={{flex: 1}}>
                        <TouchableOpacity onPress={() => {
                            this.props.goBack()
                        }}>
                            <Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
                        </TouchableOpacity>
                    </Left>
                </Header>
                <View style={styles.container}>
    
        {this.state.comments.length ? <Comments
          data={this.state.comments}
        //   viewingUserName={"test"}
        //   initialDisplayCount={10}
        //   editMinuteLimit={900}
        //   childrenPerPage={5}
        //   lastCommentUpdate={this.state.lastCommentUpdate}
          usernameTapAction={(username, uid) => {
            if (uid == this.props.profile.uid) {
              this.props.goToProfile()
            }
            else {
              this.props.viewProfile(uid)
            }
          }}
        //   childPropName={'children'}
          keyExtractor={item => item.comment_id}
          usernameExtractor={item => extractUsername(item, this.props.profile.uid)}
          uidExtractor={item => item.user.uid}
          editTimeExtractor={item => extractEditTime(item)}
          createdTimeExtractor={item => extractCreatedTime(item)}
          bodyExtractor={item => extractBody(item)}
          imageExtractor={item => extractImage(item)}
          likeExtractor={item => likeExtractor(item)}
           reportedExtractor={item => reportedExtractor(item)}
          likesExtractor={item => likesExtractor(item, this.props.profile.uid, this.props.viewProfile, this.props.goToProfile )}
          likeCountExtractor={item => item.repCount}
          childrenCountExtractor={item => extractChildrenCount(item)}
          timestampExtractor={item => new Date(item.created_at).toISOString()}
          saveAction={(text, parentCommentId) => {
            if (text) {
            this.props.comment(
              this.props.profile.uid,
              this.state.postId,
              text,
              (new Date()).toString(),
              parentCommentId,
            ).then(() => {
              console.log("comment sent")
            }).catch(e => Alert.alert('Error', e.message))
            }
          }}
          editAction={(text, comment) => {
            console.log(text)
          }}
          reportAction={(comment) => {
            console.log(comment)
          }}
          likeAction={(comment) => {
            this.props.repComment(comment)
          }}
          likesTapAction={(comment) => {
            return this.props.getCommentRepsUsers(comment)
          }}
          paginateAction={this.state.post
          && this.state.post.commentCount > this.state.commentFetchAmount ? 
          () => { 
            this.setState({commentFetchAmount: this.state.commentFetchAmount + 5}, () => {
              this.props.getComments(this.postId, this.state.commentFetchAmount)})
            } : null}
            getCommentRepsUsers={(key, amount) => this.props.getCommentRepsUsers(key, amount)}
        /> : <View style={[sStyles.spinner, {flex: 1}]}><Spinner color={colors.secondary}/></View>}

      </View>
            </Container>
        )
    }
}


import { navigateBack, navigateProfile, navigateProfileView } from 'Anyone/js/actions/navigation'
import { connect } from 'react-redux'
import {
    fetchComments,
    fetchCommentRepsUsers,
    postComment,
    repPost,
    repComment
} from './actions/home'

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
  repComment: (comment) => dispatch(repComment(comment)),
  goBack: () => dispatch(navigateBack()),
  getComments: (key, amount) => dispatch(fetchComments(key, amount)),
  getCommentRepsUsers: (comment, limit) => dispatch(fetchCommentRepsUsers(comment, limit)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PostView)