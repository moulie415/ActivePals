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
    Dimensions,
    Alert
} from 'react-native'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import firebase from 'react-native-firebase'
import colors from './constants/colors'
import TouchableOpacity from './constants/TouchableOpacityLockable'
import Comments from './comments'
import sStyles from './styles/settingsStyles'
import { getSimplified } from 'Anyone/js/chat/SessionChats'
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
  import Image from 'react-native-fast-image'
  import {Image as SlowImage} from 'react-native'

const weightUp = require('Anyone/assets/images/weightlifting_up.png')
const weightDown = require('Anyone/assets/images/weightlifting_down.png')
const SCREEN_HEIGHT = Dimensions.get('window').height

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
            //post: {},
            commentFetchAmount: 10
        }
    }

    componentDidMount() {
        this.props.getComments(this.postId)
        this.props.getPost(this.postId)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.feed && nextProps.feed[this.postId] && nextProps.feed[this.postId].comments) {
            this.setState({comments: nextProps.feed[this.postId].comments})
            
        }
        if (nextProps.feed && nextProps.feed[this.postId]) {
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
        {this.state.post && <View style={{maxHeight: SCREEN_HEIGHT/2}}>{this.renderPost(this.state.post)}</View>}
        {this.state.post && this.repCommentCount(this.state.post)}
        {this.state.comments.length ? <Comments
          data={this.state.comments}
          //viewingUserName={"test"}
          //initialDisplayCount={10}
          //editMinuteLimit={900}
          //childrenPerPage={5}
          //lastCommentUpdate={this.state.lastCommentUpdate}
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

    renderPost(item) {
      switch(item.type) {
        case 'status':
          return (
            <View style={{padding: 10, margin: 5}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {this.fetchAvatar(item.uid)}
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  {this.getUsernameFormatted(item.uid)}
                  <Text style={{color: '#999'}}>{getSimplified(item.createdAt)}</Text>
                </View>
                <Text style={{color: '#000'}}>{item.text}</Text>
              </View>
              </View>
              
            </View>
            )
      case 'photo':
        return (
            <View>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 10, paddingBottom: 0}}>
              {this.fetchAvatar(item.uid)}
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                {this.getUsernameFormatted(item.uid)}
                  <Text style={{color: '#999'}}>{getSimplified(item.createdAt)}</Text>
                </View>
                <Text style={{color: '#000'}}>{item.text}</Text>
                </View>
              </View>
              
                <View
                style={{marginTop: 10, marginBottom: 10}}>
                <Image
                style={{width: '100%', height: 400, maxHeight: SCREEN_HEIGHT/2-55}}
                resizeMode={'contain'}
                source={{uri: item.url}}
                />
                
                </View>
                

            </View>
          )
      }
  
    }
    repCommentCount(item) {
        return (
        <View style={{flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#999'}}>
          <View style={{flex: 1, marginVertical: 10, flexDirection: 'row', alignItems: 'center'}}>
            {!!item.commentCount && item.commentCount > 0 && 
            <View 
            style={{flex: 1}}
           >
            <Text style={{color: '#999', textAlign: 'center'}}>
            {`${item.commentCount} ${item.commentCount > 1 ? ' comments' : ' comment'}`}</Text></View>}
            {!!item.repCount && item.repCount > 0 && <View 
            style={{flex: 1}}
           >
           <TouchableOpacity onPress={() => {
             Alert.alert('test')
           }}>
            <Text style={{color: '#999', textAlign: 'center'}}>{`${item.repCount} ${item.repCount > 1 ? ' reps' : ' rep'}`}
            </Text></TouchableOpacity></View>}
            <TouchableOpacity
             onPress={() => {
              this.props.onRepPost(item)
            }}
             style={{flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
             <SlowImage source={item.rep ? weightUp : weightDown}
            style={{width: 25, height: 25, marginRight: 10, tintColor: item.rep ? colors.secondary : '#616770'}}/>
            <Text style={{color: item.rep ? colors.secondary : '#616770'}}>Rep</Text>
            </TouchableOpacity>
            </View>
          </View>
          )
  
    }
  

    fetchAvatar(uid) {
      if (this.props.profile.avatar && uid == this.props.profile.uid) {
        return <TouchableOpacity
        onPress={()=> uid != this.props.profile.uid ? this.props.viewProfile(uid) : this.props.goToProfile()}>
        <Image source={{uri: this.props.profile.avatar}} style={{height: 35, width: 35, borderRadius: 17, marginRight: 10}}/>
        </TouchableOpacity>
      }
      else if (this.props.friends[uid] && this.props.friends[uid].avatar) {
        return <TouchableOpacity
        onPress={()=> uid != this.props.profile.uid ? this.props.viewProfile(uid) : this.props.goToProfile()}>
        <Image source={{uri: this.props.friends[uid].avatar}} style={{height: 35, width: 35, borderRadius: 17, marginRight: 10}}/>
        </TouchableOpacity>
      }
      else {
        return <TouchableOpacity
        onPress={()=> uid != this.props.profile.uid ? this.props.viewProfile(uid) : this.props.goToProfile()}>
        <Icon name='md-contact'  style={{fontSize: 45, color: colors.primary, marginRight: 10}}/>
      </TouchableOpacity>
      }
    }

    getUsernameFormatted(uid) {
      return <TouchableOpacity onPress={()=> {
        uid != this.props.profile.uid ? this.props.viewProfile(uid) : this.props.goToProfile()
      }}>
      <Text style={{fontWeight: 'bold', color: colors.secondary, flex: 1}}>
      {uid == this.props.profile.uid ? 'You' : this.getUsername(uid)}</Text>
      </TouchableOpacity>
    }
}


import { navigateBack, navigateProfile, navigateProfileView } from 'Anyone/js/actions/navigation'
import { connect } from 'react-redux'
import {
    fetchComments,
    fetchCommentRepsUsers,
    postComment,
    repPost,
    repComment,
    fetchPost
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
  getPost: (key) => dispatch(fetchPost(key))
})

export default connect(mapStateToProps, mapDispatchToProps)(PostView)