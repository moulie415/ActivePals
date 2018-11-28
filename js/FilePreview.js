import React, { Component } from 'react'
import {
	View,
	TouchableWithoutFeedback,
	Platform,
	TextInput,
	KeyboardAvoidingView,
	Keyboard,
    Alert,
    Image
} from 'react-native'
import {
    Icon,
    Spinner
} from 'native-base'
import colors from './constants/colors'
import firebase from 'react-native-firebase'
import { guid } from './constants/utils'
import sStyles from './styles/settingsStyles'
//import Video from 'react-native-video'
import TouchableOpacity from 'Anyone/js/constants/TouchableOpacityLockable'


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
			text: "",
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
                <Image
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
                <TextInput
                style = {{
                    height: 50,
                    paddingLeft: 10,
                    width: '100%',
                    fontSize: 18,
                    backgroundColor: '#fff'
                }}
                underlineColorAndroid = 'transparent'
                onChangeText={(text) => this.setState({text})}
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
                style={{position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, alignItems: 'center', justifyContent: 'center'}}>
        			<TouchableOpacity 
                    //style = {{backgroundColor: 'white', borderRadius: 50}}
                    onPress={() => this.setState({paused: false})}>
            			<Icon
            			style = {this.state.paused ? {backgroundColor: 'transparent', opacity: 0.8} : {display: 'none'}}
            			size = {100}
            			name = {'controller-play'}
            			color = {'#fff'}/>
                    </TouchableOpacity>
                </View>
                <View style={{position: 'absolute', margin: 20}}>
                    <TouchableOpacity onPress={() => this.rejectPressed()}
                    style={{backgroundColor: colors.secondary, opacity: 0.8, padding: 10, borderRadius: 5}}>
                        <Icon
                        name = {'x'}
                        color={'#fff'}
                        size = {30}/>
                    </TouchableOpacity>
                </View>
                <View style={{position: 'absolute', margin: 20, right: 0}}>
                    <TouchableOpacity onPress={() => {this.acceptPressed()}}
                    style={{backgroundColor: colors.secondary, opacity: 0.8, padding: 10, borderRadius: 5}}>
                        <Icon
            			name ={'check'}
            			color={'#fff'}
            			size = {30}/>
                    </TouchableOpacity>
                </View>
                <TextInput
                style = {{
                    height: 50,
                    paddingLeft: 10,
                    width: '100%',
                    fontSize: 18,
                    backgroundColor: '#fff'
                }}
				underlineColorAndroid = 'transparent'
				onChangeText={(text) => this.setState({text})}
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
        this.uploadImage(this.uri).then(image => {
            let profile = this.props.profile
            let date = new Date().toString()
            if (this.message) {
                this.props.goBack()
                this.props.setMessage(image.url, this.state.text)
            }
            else {
                firebase.database().ref('userPhotos/' + profile.uid).child(image.id).set({createdAt: date, url: image.url})
                this.props.postStatus({
                type: 'photo',
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
    return new Promise((resolve, reject) => {
      //const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      let id = guid()
      const imageRef = firebase.storage().ref('images/' + this.props.profile.uid + '/photos').child(id)

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
}

import { connect } from 'react-redux'

import { navigateBack } from 'Anyone/js/actions/navigation'
import { addPost } from 'Anyone/js/actions/home'
import { setMessage } from '../js/actions/chats'
const mapStateToProps = ({ profile }) => ({
  profile: profile.profile,
})

const mapDispatchToProps = dispatch => ({
    goBack: () => dispatch(navigateBack()),
  postStatus: (status) => {return dispatch(addPost(status))},
  setMessage: (url, text) => dispatch(setMessage(url, text))
})

export default connect(mapStateToProps, mapDispatchToProps)(FilePreview)