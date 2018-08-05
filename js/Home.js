import React, { Component } from "react"
import { 
  StyleSheet,
  View,
  Alert,
  Image,
  TextInput,
  FlatList,
  Platform,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native"
import { 
  Button,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Header,
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
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import { getSimplified } from 'Anyone/js/chat/SessionChats'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import ImageViewer from 'react-native-image-zoom-viewer'

const weightUp = require('Anyone/assets/images/weightlifting_up.png')
const weightDown = require('Anyone/assets/images/weightlifting_down.png')

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

    this.state = {
      profile: this.props.profile,
      feed: Object.values(this.props.feed),
      spinner: false,
      selectedImage: null,
      showImage: false,
    }
  }

  componentDidMount() {

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
    this.setState({feed: Object.values(nextProps.feed)})
  }
}

  render () {
    const { uid, username, users } = this.props.profile
    return (
    <Container >
      <Header style={{backgroundColor: colors.primary}}>
        <Left style={{flex: 1}}/>
        <Title style={{alignSelf: 'center', color: '#fff', fontFamily: 'Avenir', flex: 1}}>Feed</Title>
        <Right>
          <TouchableOpacity onPress={()=> {
            Alert.alert("coming soon")
          }}>
            <Icon name='ios-notifications' style={{color: '#fff', marginRight: 10}}/>
          </TouchableOpacity>
        </Right>
      </Header>
        <View style={{flexDirection: 'row', backgroundColor: '#fff', padding: 10, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#999'}}>
        <TouchableOpacity onPress={()=> this.props.goToProfile()}>
          {this.state.profile && this.state.profile.avatar ?
            <Image source={{uri: this.props.profile.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/>
            : <Icon name='md-contact'  style={{fontSize: 60, color: colors.primary}}/>}
            </TouchableOpacity> 
            <TextInput 
            underlineColorAndroid={"transparent"}
            value={this.state.status}
            autoCorrect={false}
            onChangeText={(status) => this.setState({status})}
            placeholder="Post a status for your buddies..."
            style={{flex: 1, borderColor: '#999', borderWidth: 0.5, marginHorizontal: 10, height: 40, padding: 5}}/>
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
              <Icon name="ios-camera" style={{color: colors.secondary, fontSize: 40, marginRight: 10}} />
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
              <Icon name="ios-arrow-dropright-circle" style={{color: colors.secondary, fontSize: 40}}/>
            </TouchableOpacity>
        </View>
      <Content contentContainerStyle={{backgroundColor: '#9993', flex: 1}}>
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
    </Container>
  )
  }

  renderFeed() {
    if (this.state.feed.length > 0) {
      return <FlatList
        data={this.sortByDate(this.state.feed)}
        keyExtractor={(item) => item.key}
        renderItem = {({ item }) => {
          if (item.uid == this.props.profile.uid || this.props.friends[item.uid] && this.props.friends[item.uid].status == 'connected') {
            return (<Card>
              {this.renderFeedItem(item)}
              </Card>
              )}
          }
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
                <Text style={{color: '#999'}}>{getSimplified(item.createdAt)}</Text>
              </View>
              <Text style={{color: '#000'}}>{item.text}</Text>
            </View>
            </View>
            {!!item.repCount && item.repCount > 0 &&
              <View style={{ borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/>}
              {!!item.repCount && item.repCount > 0 && <View style={{marginHorizontal: 10}}>
                  <Text style={{color: '#999'}}>{`${item.repCount} ${item.repCount > 1 ? ' reps' : ' rep'}`}</Text>
                </View>}
            <View style={{borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/>
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
                <Text style={{color: '#999'}}>{getSimplified(item.createdAt)}</Text>
              </View>
              <Text style={{color: '#000'}}>{item.text}</Text>
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
            {!!item.repCount && item.repCount > 0 &&
              <View style={{ borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/>}
              {!!item.repCount && item.repCount > 0 && <View style={{marginHorizontal: 10}}>
                  <Text style={{color: '#999'}}>{`${item.repCount} ${item.repCount > 1 ? ' reps' : ' rep'}`}</Text>
                </View>}
            <View style={{borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/>
            <View style={{padding: 10}}>
            {this.repsAndComments(item)}
            </View>
          </View>
        )
    }

  }

  repsAndComments(item, addPadding = false) {
   return(<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
    <TouchableOpacity
      onPress={() => {
        this.props.onRepPost(item)
      }}
      style={{flexDirection: 'row', paddingHorizontal: 50, alignItems: 'center'}}>
      <Image source={item.rep ? weightUp : weightDown}
      style={{width: 25, height: 25, marginRight: 10, tintColor: item.rep ? colors.secondary : '#616770'}}/>
      <Text style={{color: item.rep ? colors.secondary : '#616770'}}>Rep</Text>
    </TouchableOpacity>
    <TouchableOpacity
    onPress={() => {
      Alert.alert('coming soon')
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
    else if (this.props.friends[uid].avatar) {
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
    {name: 'video', title: 'Shoot video (coming soon)'},
    {name: 'uploadVideo', title: 'Choose video from library (coming soon)'},
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
          if (response.error) {
            Alert.alert('Error',response.error)
            this.setState({spinner: false})
          }
        })
      }
      else if (response.customButton == 'video') {
        ImagePicker.launchCamera(videoOptions, (response)  => {
          if (response.error) {
            Alert.alert('Error', response.error)
            this.setState({spinner: false})
          }
        })

      }
    }
    else {
      ImageResizer.createResizedImage(response.uri, 500, 500, 'PNG', 100).then((resized) => {
        this.setState({spinner: false})
        this.props.previewFile('image', resized.uri)

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

}


import { connect } from 'react-redux'
import { navigateProfile, navigateProfileView, navigateFilePreview } from 'Anyone/js/actions/navigation'
import { addPost, repPost } from 'Anyone/js/actions/home'

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
  previewFile: (type, uri) => dispatch(navigateFilePreview(type, uri)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)