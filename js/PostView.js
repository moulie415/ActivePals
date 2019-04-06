import React, { Component } from "react"
import {
    Icon,
} from 'native-base'
import {
    View,
    Dimensions,
    Alert,
    Modal,
    SafeAreaView,
    FlatList,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback
} from 'react-native'
import FIcon from "react-native-vector-icons/FontAwesome"
import cStyles from './comments/styles'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import firebase from 'react-native-firebase'
import colors from './constants/colors'
import TouchableOpacity from './constants/TouchableOpacityLockable'
import Comments from './comments'
import sStyles from './styles/settingsStyles'
import ImageViewer from 'react-native-image-zoom-viewer'
import ParsedText from 'react-native-parsed-text'
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
    getSimplifiedTime
  } from './constants/utils'
  import styles from './styles/postViewStyles'
  import Image from 'react-native-fast-image'
  import {Image as SlowImage} from 'react-native'
  import Header from './header/header'
  import str from './constants/strings'
  import Video from 'react-native-video'
  import hStyles from './styles/homeStyles'
  import { PulseIndicator } from 'react-native-indicators'
  import PropTypes from 'prop-types'

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
            likesModalVisible: false,
            commentFetchAmount: 10,
            userFetchAmount: 10,
            showImage: false
        }
    }

    componentDidMount() {
        
        this.props.getPost(this.postId).then(() => {
          this.props.getComments(this.postId)
        })
        
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
      let combined = { ...this.props.users, ...this.props.friends}
        return(
            this.state.post ? <KeyboardAvoidingView
            contentContainerStyle={{flex: 1}}
            style={{flex: 1}}
            behavior='position'>
                <Header 
                hasBack={true}
                />
                <ScrollView style={styles.container}>
        {this.state.post && <View>{this.renderPost(this.state.post)}</View>}
        {this.state.post && this.repCommentCount(this.state.post)}
        {this.state.post && <Comments
          data={this.state.comments}
          users={Object.values(combined)}
          viewingUserName={this.props.profile.username}
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
          uidExtractor={item => item.user ? item.user.uid : null}
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
              this.postId,
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
        /> }
          <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.likesModalVisible}
          onRequestClose={() => this.setState({likesModalVisible: false, userFetchAmount: 10})}
        >
          <TouchableOpacity
            onPress={() => this.setState({likesModalVisible: false})}
            style={{
              position: "absolute",
              width: 100,
              zIndex: 9,
              alignSelf: "flex-end",
              top: 10
            }}
          >
          <SafeAreaView>
            <View style={{ position: "relative", left: 50, top: 5 }}>
              <FIcon name={"times"} size={40} />
            </View>
            </SafeAreaView>
          </TouchableOpacity>
          <SafeAreaView>
          <Text style={cStyles.likeHeader}>Users that repped the post</Text>
          </SafeAreaView>

          {this.state.likesModalVisible ? (
            <FlatList
              initialNumToRender="10"
              ListFooterComponent={(item) => this.renderRepsFooter()}
              keyExtractor={item => item.like_id || item.user_id}
              data={this.state.post.repUsers}
              renderItem={(item) => this.renderRep(item)}
            />
          ) : null}
        </Modal>
        <Modal onRequestClose={()=> null}
          visible={this.state.showImage} transparent={true}>
        <ImageViewer
          renderIndicator= {(currentIndex, allSize) => null}
          loadingRender={()=> <SafeAreaView><Text style={{color: '#fff', fontSize: 20}}>Loading...</Text></SafeAreaView>}
          renderHeader={()=> {
            return (<TouchableOpacity style={{position: 'absolute', top: 20, left: 10, padding: 10, zIndex: 9999}}
              onPress={()=> this.setState({selectedImage: null, showImage: false})}>
                <View style={{
                  backgroundColor: '#0007',
                  paddingHorizontal: 15,
                  paddingVertical: 2,
                  borderRadius: 10,
                }}>
                  <Icon name={'ios-arrow-back'}  style={{color: '#fff', fontSize: 40}}/>
                </View>
              </TouchableOpacity>)
          }}
          imageUrls={this.state.selectedImage}
            />
      </Modal>
      </ScrollView>
            </KeyboardAvoidingView> : <View style={sStyles.spinner}><PulseIndicator color={colors.secondary}/></View>
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
                  <Text style={{color: '#999'}}>{getSimplifiedTime(item.createdAt)}</Text>
                </View>
                {this.getParsedText(item.text)}
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
                  <Text style={{color: '#999'}}>{getSimplifiedTime(item.createdAt)}</Text>
                </View>
                {this.getParsedText(item.text)}
                </View>
              </View>
              
                <TouchableOpacity onPress={()=> this.setState({selectedImage: [{url: item.url}], showImage: true})}
                style={{marginTop: 10, marginBottom: 10}}>
                <Image
                style={{width: '100%', height: SCREEN_HEIGHT/2-55}}
                resizeMode={'contain'}
                source={{uri: item.url}}
                />
                
                </TouchableOpacity>
            </View>
          )
          case 'video':
          return (
            <TouchableWithoutFeedback 
            onPress = {() => {
              this.setState({playing: false})
            }}>
            <View>
      <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, padding: 10, paddingBottom: 0, zIndex: 2}}>
        {this.fetchAvatar(item.uid)}
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          {this.getUsernameFormatted(item.uid)}
            <Text style={{color: '#999'}}>{getSimplifiedTime(item.createdAt)}</Text>
          </View>
          {this.getParsedText(item.text)}
          </View>
        </View>
        <Video
            ref ={(ref) => this.player = ref}
            source = {{uri: item.url}}
            style={{width: '100%', height: SCREEN_HEIGHT/2-55}}
            paused = {!this.state.playing}
            ignoreSilentSwitch = 'ignore'
            repeat = {true}
            onFullscreenPlayerDidPresent={()=> this.setState({playing: false})}
            resizeMode = 'contain'
            onBuffer={() => {
              console.log('buffering')
            }}                // Callback when remote video is buffering
            onError={(e)=> {
              if (e.error && e.error.code) {
                Alert.alert('Error', 'code ' + e.error.code + '\n' + e.error.domain)
              }
              else if (e.message) {
                Alert.alert('Error', e.message)
              }
              else Alert.alert('Error', 'Error playing video')
            }}  
            />
           {!this.state.playing &&  <View 
            style={hStyles.playButtonContainer}>
          <TouchableOpacity 
                onPress={() => this.setState({playing: true})}>
                <Icon name = {'md-play'}
                    style={{color: '#fff', fontSize: 50, backgroundColor: 'transparent', opacity: 0.8}}
                    />
                </TouchableOpacity>
                <TouchableOpacity 
                style={{
                  bottom: 20,
                  right: 15,
                  position: 'absolute',
                  padding: 2,
                  paddingHorizontal: 6,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 5
                }}
                onPress={()=> {
                  this.setState({playing: false})
                  if (Platform.OS == 'ios') {
                    this.player.presentFullscreenPlayer()
                  }
                  else {
                    this.props.navigateFullScreenVideo(item.url)
                  }
                }}>
                <Icon name='md-expand'
             style={{
               fontSize: 30,
               backgroundColor: 'transparent',
               color: '#fff'
               }}/>
               </TouchableOpacity>
            </View>}
        </View>
      </TouchableWithoutFeedback>
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
             this.props.getRepUsers(item.key, this.state.userFetchAmount)
            this.setState({likesModalVisible: true})
           }}>
            <Text style={{color: '#999', textAlign: 'center'}}>{`${item.repCount} ${item.repCount > 1 ? ' reps' : ' rep'}`}
            </Text></TouchableOpacity></View>}
            <TouchableOpacity
             onPress={(mutex) => {
               mutex.lockFor(1000)
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

    renderRep(l) {
      let like = l.item
      return (
        <TouchableOpacity
          onPress={() => {
            this.setState({likesModalVisible: false})
            like.user_id == this.props.profile.uid ? this.props.goToProfile() : this.props.viewProfile(like.user_id)
          }}
          style={cStyles.likeButton}
          key={like.user_id + ""}
        >
          <View style={[cStyles.likeContainer]}>
            {like.image ? <Image style={[cStyles.likeImage]} source={{ uri: like.image }} /> : <Icon name='md-contact'  style={{fontSize: 40, color: colors.primary, }} />}
            <Text style={[cStyles.likeName]}>{like.username}</Text>
          </View>
        </TouchableOpacity>
      )
    }
  
    renderRepsFooter() {
      if (this.state.post.repCount > this.state.userFetchAmount) {
        return <TouchableOpacity 
        style={{alignItems: 'center'}}
        onPress={()=> {
          this.setState({userFetchAmount: this.state.userFetchAmount + 5}, () => {
            this.props.getRepUsers(this.postId, this.state.userFetchAmount)
          })
          
        }}>
          <Text style={{color: colors.secondary}}>Show more</Text>
          </TouchableOpacity>
      }
      else return null
  
    }

    getParsedText(text) {
      return <ParsedText 
      style={{color: '#000'}}
      parse={
        [
          {pattern: str.mentionRegex, style: {color: colors.secondary}, onPress: this.handleUsernamePress.bind(this) }
        ]
      }
      >{text}
      </ParsedText>
    }
    handleUsernamePress(name) {
      name = name.substring(1)
      let friends = Object.values(this.props.friends)
      let users = Object.values(this.props.users)
      let combined = [...friends, ...users]
      if (name == this.props.profile.username) {
        this.props.goToProfile()
      }
      else {
        let found = combined.find(friend => friend.username == name)
        if (found) {
          this.props.viewProfile(found.uid)
        }
        else {
          firebase.database().ref('usernames').child(name).once('value', snapshot => {
            if (snapshot.val()) {
              this.props.viewProfile(snapshot.val())
            }
          })
          .catch(e => console.log(e))
        }
        
       
      }
    }

    getUsername(uid) {
      if (this.props.friends[uid]) {
        return this.props.friends[uid].username
      }
     else if (this.props.users[uid]) {
      return this.props.users[uid].username
     }
     else return 'N/A'
   }
}

PostView.propTypes = {
  friends: PropTypes.any,
  users: PropTypes.any,
  profile: PropTypes.any,
  navigation: PropTypes.any,
  feed: PropTypes.any,
  viewProfile: PropTypes.func,
  goToProfile: PropTypes.func,
  getRepUsers: PropTypes.func,
  getPost: PropTypes.func,
  getComments: PropTypes.func,
  comment: PropTypes.func,
  repComment: PropTypes.func,
  navigateFullScreenVideo: PropTypes.func,
  getCommentRepsUsers: PropTypes.func,
}


import {
  navigateBack,
  navigateProfile,
  navigateProfileView,
  navigateFullScreenVideo
} from './actions/navigation'
import { connect } from 'react-redux'
import {
    fetchComments,
    fetchCommentRepsUsers,
    postComment,
    repPost,
    repComment,
    fetchPost,
    fetchRepUsers
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
  getPost: (key) => dispatch(fetchPost(key)),
  getRepUsers: (postId, limit) => dispatch(fetchRepUsers(postId, limit)),
  navigateFullScreenVideo: (url) => dispatch(navigateFullScreenVideo(url))
})

export default connect(mapStateToProps, mapDispatchToProps)(PostView)