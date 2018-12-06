import React, { Component } from 'react'
import {
	View,
	TouchableWithoutFeedback,
	Platform,
	TextInput,
	KeyboardAvoidingView,
	Keyboard,
    Alert,
    FlatList
} from 'react-native'
import {
    Icon,
    Spinner,
} from 'native-base'
import colors from './constants/colors'
import firebase from 'react-native-firebase'
import { guid } from './constants/utils'
import sStyles from './styles/settingsStyles'
import styles from './styles/homeStyles'
import Video from 'react-native-video'
import TouchableOpacity from 'Anyone/js/constants/TouchableOpacityLockable'
import { getMentionsList } from './constants/utils'
import Image from 'react-native-fast-image'
import {Image as SlowImage } from 'react-native'
import Text from './constants/Text'


class FilePreview extends Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
		super(props)
        this.params = this.props.navigation.state.params
        this.type = this.params.type
        this.uri = this.params.uri
        this.message = this.params.message
		this.state = {
			paused: true,
			text: this.params.text,
            spinner: false
		}
	}
      
	componentDidMount() {
		if (this.type === "video") {
			this.player.presentFullscreenPlayer()
			this.player.seek(0)
		}
	}


    render() {
        return (
            Platform.select({
                ios: (
                    <KeyboardAvoidingView
                    behavior = {'padding'}
                    style = {{flex: 1}}>
                        {this.previewView()}
                    </KeyboardAvoidingView>
                ),
                android: this.previewView()
            })
        )
    }


	previewView() {
		if (this.type === "video") {
			return this.renderVideo()
		}
		else if (this.type === "image") {
            return this.renderImage()
		}
		else {
			//Alert.alert(str_chat.typeNotSupportedTitle, str_chat.typeNotSupportedBody)
		}
	}

    renderImage() {
        return <TouchableWithoutFeedback
        onPress = {Keyboard.dismiss}
        style = {{flex: 1}}>
            <View style={{flex: 1}}>
                <SlowImage
                style={{flex: 1, resizeMode: 'contain'}}
                //use uri to display image else it won't display on android
                source={{uri: this.uri}}
                />
                <View style={{position: 'absolute', margin: 20, marginTop: 30}}>
                    <TouchableOpacity onPress={() => this.rejectPressed()}
                    style={{backgroundColor: colors.secondary, opacity: 0.8, padding: 10, paddingHorizontal: 15, borderRadius: 5}}>
                        <Icon
                        name = {'md-close'}
                        style={{color: '#fff', fontSize: 30}}/>
                    </TouchableOpacity>
                </View>
                <View style={{position: 'absolute', margin: 20, marginTop: 30, right: 0}}>
                    <TouchableOpacity onPress={() => this.acceptPressed()}
                    style={{backgroundColor: colors.secondary, opacity: 0.8, padding: 10,paddingHorizontal: 15, borderRadius: 5}}>
                        <Icon
                        name ={'md-checkmark'}
                        style={{color: '#fff', fontSize: 30}}/>
                    </TouchableOpacity>
                </View>
                {this.state.mentionList && !this.message && this.renderMentionList()}
                <TextInput
                style = {{
                    height: 50,
                    paddingLeft: 10,
                    width: '100%',
                    fontSize: 18,
                    backgroundColor: '#fff'
                }}
                underlineColorAndroid = 'transparent'
                onChangeText={(text) => {
                    this.setState({text})
                    let friends = Object.values(this.props.friends)
                    let list = getMentionsList(text, friends)
                    list ? this.setState({mentionList: list}) : this.setState({mentionList: null})
                    }}
                value={this.state.text}
                multiline = {false}
                autoCorrect={true}
                placeholder = {'Add comment...'}/>
              {this.state.spinner && <View style={sStyles.spinner}><Spinner color={colors.secondary}/></View>}
            </View>
        </TouchableWithoutFeedback>
    }

	renderVideo() {
		return <TouchableWithoutFeedback onPress = {() => {
			this.setState({paused: true})
			Keyboard.dismiss()
		}}>
            <View style={{flex: 1}}>
                <Video 
                ref = { ref => this.player = ref }
                source = {{uri: this.uri}}
                style={{flex: 1}}
                paused = {this.state.paused}
                ignoreSilentSwitch = 'ignore'
                repeat = {true}
                resizeMode = 'cover'
                />
                <View 
                style={styles.playButtonContainer}>
        			<TouchableOpacity 
                    onPress={() => this.setState({paused: false})}>
            			{this.state.paused && <Icon
            			name = {'md-play'}
                        style={{color: '#fff', fontSize: 75, backgroundColor: 'transparent', opacity: 0.8}}
                        />}
                    </TouchableOpacity>
                </View>
                <View style={{position: 'absolute', margin: 20}}>
                    <TouchableOpacity onPress={() => this.rejectPressed()}
                    style={{backgroundColor: colors.secondary, opacity: 0.8, padding: 10, borderRadius: 5}}>
                        <Icon
                        name = {'md-close'}
                        style={{color: '#fff', fontSize: 30}}/>
                    </TouchableOpacity>
                </View>
                <View style={{position: 'absolute', margin: 20, right: 0}}>
                    <TouchableOpacity onPress={() => {this.acceptPressed()}}
                    style={{backgroundColor: colors.secondary, opacity: 0.8, padding: 10, borderRadius: 5}}>
                        <Icon
            			name ={'md-checkmark'}
                        style={{color: '#fff', fontSize: 30}}/>
                    </TouchableOpacity>
                </View>
                {this.state.mentionList && !this.message && this.renderMentionList()}
                <TextInput
                style = {{
                    height: 50,
                    paddingLeft: 10,
                    width: '100%',
                    fontSize: 18,
                    backgroundColor: '#fff'
                }}
				underlineColorAndroid = 'transparent'
				onChangeText={(text) => {
                    this.setState({text})
                    let friends = Object.values(this.props.friends)
                    let list = getMentionsList(text, friends)
                    list ? this.setState({mentionList: list}) : this.setState({mentionList: null})
                    }}
				value={this.state.text}
				multiline = {false}
				autoCorrect={true}
				placeholder = {'Add comment...'}/>
              {this.state.spinner && <View style={sStyles.spinner}><Spinner color={colors.secondary}/></View>}
			</View>
		</TouchableWithoutFeedback>
	}


	rejectPressed() {
        this.props.goBack()
	}

	acceptPressed() {
        this.setState({spinner: true})

        let type, ref
        if (this.type == 'image') {
            type = 'photo'
            ref = 'userPhotos/'
        }
        else if (this.type == 'video') {
            type = 'video'
            ref = 'userVideos/'
        }

            this.uploadImage(this.uri).then(image => {
                let profile = this.props.profile
                let date = new Date().toString()
                if (this.message) {
                    this.props.goBack()
                    this.props.setMessage(image.url, this.state.text)
                }
                else {
                    firebase.database().ref(ref + profile.uid).child(image.id).set({createdAt: date, url: image.url})
                    this.props.postStatus({
                    type: type,
                    url: image.url,
                    text: this.state.text, uid: profile.uid,
                    createdAt: date})
                    .then(() => {
                        this.props.goBack()
                        Alert.alert('Success', 'Post submitted')
                        this.setState({spinner: false})
                    })
                    .catch(e => {
                    Alert.alert('Error', e.message)
                    this.setState({spinner: false})
                })
            }
            })
            .catch(e => {
                Alert.alert('Error', e.message)
                this.setState({spinner: false})
            })
    
    }

  uploadImage(uri, mime = 'application/octet-stream') {
    if (this.type == 'video') {
        mime = 'video/mp4'
    }
    let uid = this.props.profile.uid
    let ref = this.type == 'image' ? 'images/' + uid + '/photos' : 'videos/' + uid 
  
    return new Promise((resolve, reject) => {
      //const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      let id = guid()
      const imageRef = firebase.storage().ref(ref).child(id)

      return imageRef.putFile(uri, { contentType: mime })
      .then(() => {
          return imageRef.getDownloadURL()
      })
      .then((url) => {
          resolve({url, id})
      })
      .catch((error) => {
          reject(error)
      })
  })
}

renderMentionList() {
    return <View style={[styles.mentionList, { bottom: 0, marginBottom: 50}] }>
    <FlatList 
      keyboardShouldPersistTaps={'handled'}
      data={this.state.mentionList}
      style={{backgroundColor: '#fff'}}
      keyExtractor={(item) => item.uid}
      renderItem={({item, index}) => {
        if (index < 10) {
        return <TouchableOpacity
        onPress={() => {
          let split = this.state.text.split(" ")
          split[split.length - 1] = "@" + item.username + " "
          this.setState({text: split.join(" "), mentionList: null})

        }}
        style={{backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 5}}>
          {item.avatar ? <Image source={{uri: item.avatar}} style={{height: 30, width: 30, borderRadius: 15}}/>
    : <Icon name='md-contact'  style={{fontSize: 35, color: colors.primary}}/>}
          <Text style={{marginLeft: 10}}>{item.username}</Text>
        </TouchableOpacity>
        }
        return null
      }}
    /></View>
}
}

import { connect } from 'react-redux'

import { navigateBack } from 'Anyone/js/actions/navigation'
import { addPost } from 'Anyone/js/actions/home'
import { setMessage } from '../js/actions/chats'
const mapStateToProps = ({ profile, friends }) => ({
  profile: profile.profile,
  friends: friends.friends
})

const mapDispatchToProps = dispatch => ({
    goBack: () => dispatch(navigateBack()),
  postStatus: (status) => {return dispatch(addPost(status))},
  setMessage: (url, text) => dispatch(setMessage(url, text))
})

export default connect(mapStateToProps, mapDispatchToProps)(FilePreview)