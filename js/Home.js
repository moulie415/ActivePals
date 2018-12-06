import React, { Component } from "react"
import { 
  View,
  Alert,
  TextInput,
  FlatList,
  Modal,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native"
import { 
  Container,
  Content,
  Icon,
  Title,
  Card,
  Left,
  Right,
  Spinner
} from 'native-base'
import firebase from 'react-native-firebase'
import colors from './constants/colors'
import TouchableOpacity from './constants/TouchableOpacityLockable'
import  styles  from './styles/homeStyles'
import sStyles from './styles/settingsStyles'
import cStyles from './comments/styles'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import ImageViewer from 'react-native-image-zoom-viewer'
import ModalBox from 'react-native-modalbox'
import Comments from './comments'
import FIcon from "react-native-vector-icons/FontAwesome"
import Image from 'react-native-fast-image'
import {Image as SlowImage } from 'react-native'
import Header from './header/header'
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
  getSimplifiedTime,
  getMentionsList,
} from './constants/utils'
import { AdSettings, NativeAdsManager  } from 'react-native-fbads'
import str from './constants/strings'
import NativeAdView from './AdView'
import ParsedText from 'react-native-parsed-text'
import Video from 'react-native-video'

const adsManager = new NativeAdsManager(str.nativePlacementId);

// AdSettings.clearTestDevices()
// AdSettings.setLogLevel('none')
// AdSettings.addTestDevice(AdSettings.currentDeviceHash)

const weightUp = require('Anyone/assets/images/weightlifting_up.png')
const weightDown = require('Anyone/assets/images/weightlifting_down.png')

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height


class Home extends Component {

  static navigationOptions = {
    header: null,
    tabBarLabel: 'Sessions',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-home'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)
    this.players = {}
    this.state = { 
      profile: this.props.profile,
      feed: this.props.feed,
      //feedObj: this.props.feed,
      spinner: false,
      selectedImage: null,
      showImage: false,
      commentFetchAmount: 10,
      userFetchAmount: 10,
      refreshing: false,
      likesModalVisible: false,
      loadMore: true,
      paused: true,
    }
  }

  componentDidMount() {
    
    firebase.messaging().requestPermission()
      .then(() => {
       console.log("messaging permission granted")
      })
      .catch(error => {
        console.log("messaging permission denied")
      })
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        this.user = user
         // User is signed in.
        } else {
        // No user is signed in.
        }
      })
}

sortByDate(array) {
  array.sort(function(a,b){
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  return array
}

componentWillReceiveProps(nextProps) {
  if (nextProps.profile) {
    this.setState({profile: nextProps.profile})
  }
  if (nextProps.feed) {
    this.setState({feed: nextProps.feed} /*feedObj: nextProps.feed*/)
  }
}

  render () {
    const { uid, username, users, unreadCount } = this.props.profile
    let combined = { ...this.props.users, ...this.props.friends}
    return (
    <Container>
      <Header 
        title={'Feed'}
        right={<TouchableOpacity onPress={()=> {
            this.props.onNotificationPress()
          }}>
            {/*<Icon name='ios-notifications' style={{color: '#fff', marginRight: 10}}/>*/}
            <View style={{width: 30, alignItems: 'center'}}>
              <Icon name='ios-notifications' style={{ color: '#fff', marginLeft: -10 }} />
			        {!!unreadCount && unreadCount > 0 && <View 
				        style={styles.unreadBadge}>
				          <Text numberOfLines={1} 
				          adjustsFontSizeToFit={unreadCount > 0}
				          style={{ fontSize: 10, color: '#fff'}}>{unreadCount}</Text>
			            </View>}
		              </View>
          </TouchableOpacity>}
      />
        <View style={{flexDirection: 'row', backgroundColor: '#fff', padding: 10, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#999'}}>
        <TouchableOpacity onPress={()=> this.props.goToProfile()}>
          {this.state.profile && this.state.profile.avatar ?
            <Image source={{uri: this.props.profile.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/>
            : <Icon name='md-contact'  style={{fontSize: 60, color: colors.primary}}/>}
            </TouchableOpacity> 
            <TextInput 
            ref={(ref) => this.input = ref}
            underlineColorAndroid={"transparent"}
            value={this.state.status}
            maxLength={280}
            autoCorrect={false}
            onChangeText={(status) => {
              this.setState({status})
              let friends = Object.values(this.props.friends)
              let list = getMentionsList(status, friends)
              list ? this.setState({mentionList: list}) : this.setState({mentionList: null})              
            }}
            placeholder="Post a status for your pals..."
            style={{
              flex: 1,
              borderColor: '#999',
              borderWidth: 0.5,
              marginHorizontal: 10,
              height: 40,
              padding: 5,
              }}/>
            <TouchableOpacity onPress={()=> {
              if (username) {
                this.showPicker()
              }
              else {
                Alert.alert(
                  'Username not set',
                  'You need a username before making posts, go to your profile now?',
                  [
                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: 'OK', onPress: () => this.props.goToProfile()},
                  ]
                  )
              }
            }}>
              <Icon name="md-image" style={{color: colors.secondary, fontSize: 40, marginRight: 10}} />
            </TouchableOpacity>
            <TouchableOpacity onPress={(mutex) => {
              mutex.lockFor(1000)
              if (this.state.status) {
                if (username) {
                  Alert.alert(
                    "Confirm",
                    "Submit post?",
                    [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'Yes', style: 'positive', onPress: ()=> {
                      this.props.postStatus({type: 'status', text: this.state.status, uid, username, createdAt: (new Date()).toString()})
                      .then(() => this.setState({status: ""}))
                      .catch(e => Alert.alert('Error', e.message))
                    }}
                    ]
                    )
                }
                else {
                  Alert.alert(
                    'Username not set',
                    'You need a username before making posts, go to your profile now?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => this.props.goToProfile()},
                    ]
                    )
                }
              }
              else {
                //alert no status
              }
            }}>
              <FIcon name="chevron-circle-right" style={{color: colors.secondary, fontSize: 40}}/>
            </TouchableOpacity>
        </View>
        
      <Content contentContainerStyle={{backgroundColor: '#9993', flex: 1}}>
            {this.state.mentionList && 
            <View style={styles.mentionList}>
            <FlatList 
              keyboardShouldPersistTaps={'handled'}
              data={this.state.mentionList}
              style={{backgroundColor: '#fff'}}
              keyExtractor={(item) => item.uid}
              renderItem={({item, index}) => {
                if (index < 10) {
                return <TouchableOpacity
                onPress={() => {
                  let split = this.state.status.split(" ")
                  split[split.length - 1] = "@" + item.username + " "
                  this.setState({status: split.join(" "), mentionList: null})

                }}
                style={{backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 5}}>
                  {item.avatar ? <Image source={{uri: item.avatar}} style={{height: 30, width: 30, borderRadius: 15}}/>
            : <Icon name='md-contact'  style={{fontSize: 35, color: colors.primary}}/>}
                  <Text style={{marginLeft: 10}}>{item.username}</Text>
                </TouchableOpacity>
                }
                return null
              }}
            /></View>}
        {this.props.friends && this.state.profile && this.renderFeed()}
      </Content>
      {this.state.spinner && <View style={sStyles.spinner}><Spinner color={colors.secondary}/></View>}
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
      <ModalBox
          style={{
            width: SCREEN_WIDTH - 20,
            height: SCREEN_HEIGHT - 100,
            marginTop: isIphoneX() ? 40 : 0,
            borderRadius: 5,
            padding: 5,
            }}
          swipeToClose={false}
          onClosed={()=> this.setState({focusCommentInput: false, commentFetchAmount: 10})}
          ref={"commentModal"}
          backButtonClose={true}
          position={'center'}
          >
          <TouchableOpacity onPress={()=> this.refs.commentModal.close()}>
            <Icon name={'ios-arrow-back'}  style={{color: '#000', fontSize: 30, padding: 10}}/>
           </TouchableOpacity>
            <Comments
          data={this.state.postId && this.state.feed[this.state.postId] && this.state.feed[this.state.postId].comments ? 
           this.state.feed[this.state.postId].comments : []}
          viewingUserName={this.props.profile.username}
          initialDisplayCount={10}
          editMinuteLimit={900}
          focusCommentInput={this.state.focusCommentInput}
          childrenPerPage={5}
          lastCommentUpdate={this.state.lastCommentUpdate}
          users={Object.values(combined)}
          usernameTapAction={(username, uid) => {
            if (uid == this.props.profile.uid) {
              this.props.goToProfile()
            }
            else {
              this.props.viewProfile(uid)
            }
          }}
          childPropName={'children'}
          isChild={() =>this.isCommentChild(item)}
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
          // replyAction={offset => {
          //   //this.refs.scrollView.scrollTo({x: null, y: this.scrollIndex + offset - 300, animated: true})
          // }}
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
          paginateAction={this.state.feed[this.state.postId] 
          && this.state.feed[this.state.postId].commentCount > this.state.commentFetchAmount ? 
          () => { 
            this.setState({commentFetchAmount: this.state.commentFetchAmount + 5}, () => {
              this.props.getComments(this.state.postId, this.state.commentFetchAmount)})
            } : null}
            getCommentRepsUsers={(key, amount) => this.props.getCommentRepsUsers(key, amount)}
        />
        </ModalBox>
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
              data={this.state.feed[this.state.postId].repUsers}
              renderItem={(item) => this.renderRep(item)}
            />
          ) : null}
        </Modal>
        
    </Container>
  )
  }

  renderFeed() {
    if (Object.values(this.state.feed).length > 0) {
      return <FlatList
        ref={(ref) => this.feed = ref}
        data={this.sortByDate(Object.values(this.state.feed))}
        keyExtractor={(item) => item.key}
        onRefresh={() => {
          this.setState({refreshing: true})
          this.props.getFriends()
          this.props.getProfile()
          this.props.getPosts(this.props.profile.uid, 30).then(() => {
            this.setState({refreshing: false})
          })
        }}
        // onEndReached={()=> {
        //   this.setState({fetchAmount: this.state.fetchAmount+15}, () => {
        //     this.props.getPosts(this.props.profile.uid, this.state.fetchAmount)
        //   })
        // }}
        ListFooterComponent={()=> {
          let initial = Object.values(this.state.feed).length
            if (initial > 29 && this.state.loadMore) {
            return <Card>
            <TouchableOpacity 
              style={{alignItems: 'center', paddingVertical: 10}}
              onPress={()=> {
                let feed = Object.keys(this.state.feed)
                let endAt = feed[feed.length-1]
                this.setState({spinner:  true}, () => {
                  this.props.getPosts(this.props.profile.uid, 30, endAt)
                  .then(() => {
                    if (Object.values(this.state.feed).length == initial) {
                      this.setState({loadMore: false})
                    }
                    this.setState({spinner: false})
                  })
                })
              }}>
            <Text style={{color: colors.secondary}}>Load more</Text>
            </TouchableOpacity></Card> 
          }
          else return null
        }}
        refreshing={this.state.refreshing}
        renderItem = {({ item, index }) => {
            return (<View>
              <Card>
                {this.renderFeedItem(item)}
              </Card>
              {(index > 0 && index % 4 == 0) && <Card>
                <NativeAdView adsManager={adsManager} />
                </Card>}
              </View>
              )}
        }
      />
    }
    else return <Text style={{fontSize: 20, alignSelf: 'center', marginTop: 20, color: '#999'}}>No feed items yet</Text>
  }
 
  renderFeedItem(item) {
    switch(item.type) {
      case 'status':
        return (
          <View style={{padding: 10, margin: 5}}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            {this.fetchAvatar(item.uid)}
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                {this.getUsernameFormatted(item.uid)}
                <Text style={{color: '#999'}}>{getSimplifiedTime(item.createdAt)}</Text>
              </View>
              {this.getParsedText(item.text)}
            </View>
            </View>
            {this.repCommentCount(item)}
            {this.repsAndComments(item)}
          </View>
          )
    case 'photo':
      return (
          <View>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, padding: 10, paddingBottom: 0}}>
            {this.fetchAvatar(item.uid)}
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              {this.getUsernameFormatted(item.uid)}
                <Text style={{color: '#999'}}>{getSimplifiedTime(item.createdAt)}</Text>
              </View>
              {this.getParsedText(item.text)}
              </View>
            </View>
              <TouchableOpacity
              activeOpacity={1}
              onPress={()=> {
                this.setState({selectedImage: [{url: item.url}], showImage: true})
              }}
              style={{marginTop: 10, marginBottom: 10}}>
              <Image
              style={{width: '100%', height: 400}}
              resizeMode={'cover'}
              source={{uri: item.url}}
              />
              </TouchableOpacity>
              {this.repCommentCount(item)}
            <View style={{padding: 10}}>
            {this.repsAndComments(item)}
            </View>
          </View>
        )
      case 'video':
              return (
                <TouchableWithoutFeedback onPress = {() => {
                  this.setState({paused: true})
                }}>
                <View>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, padding: 10, paddingBottom: 0}}>
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
                ref={(ref) => this.players[item.uid] = ref}
                source = {{uri: item.url}}
                style={{width: '100%', height: 400}}
                paused = {this.state.paused}
                ignoreSilentSwitch = 'ignore'
                repeat = {true}
                resizeMode = 'cover'
                onBuffer={() => {
                  console.log('buffering')
                }}                // Callback when remote video is buffering
                onError={(e)=> {
                  if (e.error) {
                    Alert.alert('Error', 'code ' + e.error.code + '\n' + e.error.domain)
                  }
                  else Alert.alert('Error', 'Error playing video')
                }}  
                />
                <View 
                style={styles.playButtonContainer}>
        			<TouchableOpacity 
                    onPress={() => this.setState({paused: false})}>
            			{this.state.paused && <Icon
            			name = {'md-play'}
                        style={{color: '#fff', fontSize: 50, backgroundColor: 'transparent', opacity: 0.8}}
                        />}
                    </TouchableOpacity>
                    <TouchableOpacity 
                    style={{
                      bottom: 70,
                      right: 15,
                      position: 'absolute',
                      padding: 10,
                    }}
                    onPress={()=> {
                      this.players[item.uid].presentFullscreenPlayer()
                    }}>
                 {this.state.paused && <Icon name='md-expand'
                 style={{
                   fontSize: 30,
                   backgroundColor: 'transparent',
                   color: '#fff'
                   }}/>}
                   </TouchableOpacity>
                </View>
              {this.repCommentCount(item)}
            <View style={{padding: 10}}>
            {this.repsAndComments(item)}
            </View>
            </View>
          </TouchableWithoutFeedback>
              )
    }

  }

  repCommentCount(item) {
    if ((item.repCount && item.repCount > 0) || (item.commentCount && item.commentCount > 0)) {
      return (<View>
      <View style={{ borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/>
      <View style={{marginHorizontal: 10, flexDirection: 'row'}}>
          {!!item.repCount && item.repCount > 0 && <TouchableOpacity 
          style={{flex: 1}}
          onPress={()=>{
            this.setState({likesModalVisible: true, postId: item.key})
            this.props.getRepUsers(item.key, this.state.userFetchAmount)
              .catch(e => Alert.alert('Error', e.message))
            
          }}>
          <Text style={{color: '#999'}}>{`${item.repCount} ${item.repCount > 1 ? ' reps' : ' rep'}`}
          </Text></TouchableOpacity>}
          {!!item.commentCount && item.commentCount > 0 && 
          <TouchableOpacity 
          style={{alignSelf: 'flex-end', flex: 1}}
          onPress={()=> {
            this.refs.commentModal.open()
            this.setState({ postId: item.key })
            this.props.getComments(item.key)
          }}>
          <Text style={{color: '#999', textAlign: 'right'}}>
          {`${item.commentCount} ${item.commentCount > 1 ? ' comments' : ' comment'}`}</Text></TouchableOpacity>}
        </View>
        <View style={{borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/></View>)

    }
    else return <View style={{borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/>

  }

  repsAndComments(item, addPadding = false) {
   return(<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
    <TouchableOpacity
      onPress={(mutex) => {
        mutex.lockFor(1000)
        this.props.onRepPost(item)
      }}
      style={{flexDirection: 'row', paddingHorizontal: 50, alignItems: 'center'}}>
      <SlowImage source={item.rep ? weightUp : weightDown}
      style={{width: 25, height: 25, marginRight: 10, tintColor: item.rep ? colors.secondary : '#616770'}}/>
      <Text style={{color: item.rep ? colors.secondary : '#616770'}}>Rep</Text>
    </TouchableOpacity>
    <TouchableOpacity
    onPress={() => {
      this.refs.commentModal.open()
      this.setState({focusCommentInput: true, postId: item.key})
      this.props.getComments(item.key)
    }}
    style={{flexDirection: 'row', paddingHorizontal: 50, alignItems: 'center'}}>
      <Icon name='md-chatboxes' style={{marginRight: 10, color: '#616770'}}/>
      <Text style={{color: '#616770'}}>Comment</Text>
    </TouchableOpacity>
   </View>)
  }

  fetchAvatar(uid) {
    if (this.state.profile.avatar && uid == this.props.profile.uid) {
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

showPicker() {
  let videoOptions = {
    mediaType: 'video',
    durationLimit: 30,
  }
  let options = {
    title: null,
    mediaType: 'photo',
    customButtons: [
    {name: 'video', title: 'Shoot video...'},
    {name: 'uploadVideo', title: 'Choose video from library...'},
    ],
    noData: true,
    storageOptions: {
      skipBackup: true,
    }
  }
  ImagePicker.showImagePicker(options, (response) => {
    this.setState({spinner: true})
    console.log('Response = ', response)

    if (response.didCancel) {
      console.log('User cancelled image picker')
      this.setState({spinner: false})
    }
    else if (response.error) {
      Alert.alert('Error', response.error)
      this.setState({spinner: false})
    }
    else if (response.customButton) {
      if (response.customButton == 'uploadVideo') {
        ImagePicker.launchImageLibrary(videoOptions, (response)  => {
          this.setState({spinner: false})
          if (response.error) {
            Alert.alert('Error',response.error)
          }
          else if (response.uri) {
            this.props.previewFile('video', response.uri, false, this.state.status)
          }
        })
      }
      else if (response.customButton == 'video') {
        ImagePicker.launchCamera(videoOptions, (response)  => {
          this.setState({spinner: false})
          if (response.error) {
            Alert.alert('Error', response.error) 
          }
          else if (response.uri) {
            this.props.previewFile('video', response.uri, false, this.state.status)
          }
        })

      }
    }
    else {
      const size = 720
      ImageResizer.createResizedImage(response.uri, size, size, 'JPEG', 100).then((resized) => {
        this.setState({spinner: false})
        this.props.previewFile('image', resized.uri, false, this.state.status)

    }).catch((e) => {
      Alert.alert('Error', e.message)
      this.setState({spinner: false})
    })


    }
  })
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
    if (this.state.feed[this.state.postId].repCount > this.state.userFetchAmount) {
      return <TouchableOpacity 
      style={{alignItems: 'center'}}
      onPress={()=> {
        this.setState({userFetchAmount: this.state.userFetchAmount + 5}, () => {
          this.props.getRepUsers(this.state.postId, this.state.userFetchAmount)
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

}

import { connect } from 'react-redux'
import {
  navigateProfile,
  navigateProfileView,
  navigateFilePreview,
  navigateNotifications
} from 'Anyone/js/actions/navigation'
import { 
  addPost,
  repPost,
  postComment,
  fetchComments,
  repComment,
  fetchPosts,
  fetchCommentRepsUsers,
  fetchRepUsers
 } from 'Anyone/js/actions/home'
import { isIphoneX } from "react-native-iphone-x-helper"
import { fetchProfile } from "./actions/profile"
import { fetchFriends } from "./actions/friends";

const mapStateToProps = ({ profile, home, friends, sharedInfo }) => ({
  profile: profile.profile,
  feed: home.feed,
  friends: friends.friends,
  users: sharedInfo.users,
})

const mapDispatchToProps = dispatch => ({
  goToProfile: () => dispatch(navigateProfile()),
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  postStatus: (status) => {return dispatch(addPost(status))},
  onRepPost: (item) => dispatch(repPost(item)),
  previewFile: (type, uri, message, text) => dispatch(navigateFilePreview(type, uri, message, text)),
  comment: (uid, postId, text, created_at, parentCommentId) => dispatch(postComment(uid, postId, text, created_at, parentCommentId)),
  getComments: (key, amount) => dispatch(fetchComments(key, amount)),
  repComment: (comment) => dispatch(repComment(comment)),
  getPosts: (uid, amount, endAt) => dispatch(fetchPosts(uid, amount, endAt)),
  getCommentRepsUsers: (comment, limit) => dispatch(fetchCommentRepsUsers(comment, limit)),
  getRepUsers: (postId, limit) => dispatch(fetchRepUsers(postId, limit)),
  onNotificationPress: () => dispatch(navigateNotifications()),
  getProfile: () => dispatch(fetchProfile()),
  getFriends: () => dispatch(fetchFriends())
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)