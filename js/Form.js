import React, { Component } from 'react'
import {
    View,
    Image,
    ImageBackground,
    FlatList,
    NativeModules,
    Alert,
    TextInput,
    ImagePickerIOS,
    ActivityIndicator,
    Keyboard,
    Platform,
    NativeEventEmitter,
    DeviceEventEmitter,
    Linking,
    KeyboardAvoidingView
} from 'react-native'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import TouchableOpacity from './constants/TouchableOpacityLockable'

import ImagePicker from 'react-native-image-picker'
import styles from './styles/formStyles'
import colors from './constants/colors'
import Header from './header/header'
const str_support = {
    supportMenuTitle: 'Support',
    supportRequestTitle: 'Support Request',
    supportRequestButton: 'Support Request',
    faqButton: 'FAQ',
    ticketsButton: 'My Tickets',
    reportIssueHeader: 'Report an Issue',
    mandatory: 'Mandatory',
    nameTitle: 'Name',
    namePlaceholder: 'Your name',
    emailTitle: 'Email',
    emailPlaceholder: 'Your email',
    subjectTitle: 'Subject',
    subjectPlaceholder: 'Example: Call quality',
    issueTitle: 'Issue',
    issuePlaceholder: "Example: When I'm calling, I hear a weird fizz...",
    photoTitle: 'Add Photo',
    sendingIndicator: 'Sending...',
    sendingInfo: 'This may take a moment if you have attached photos',
    sendFailIndicator: 'Failed to send',
    sendFailInfo: "Sorry we could not send your support request at this time",
    sentIndicator: 'Thanks for your feedback!',
    sentInfo: "The issue has been sent to our support team and we'll get back to you as soon as we can",
    noEmailAlertTitle: 'Email required',
    noEmailAlertBody: 'Please enter an email address',
    invalidEmailAlertTitle: 'Email invalid',
    invalidEmailAlertBody: 'Please enter a valid email address',
    noSubjectAlertTitle: 'Subject required',
    noSubjectAlertBody: 'Please add a subject to the issue',
    photosPermissionDenied: "The app does not have permission to access your photos, you have to go into settings to allow this, go to settings now?"
}


class Form extends Component {



    constructor(props) {
        super(props)
        this.state = { 
            photos:[],
            sendState:'none',
            name:'',
            email:'',
            subject:'',
            issue:'',
            required:'none',
            listStyle: {flex:1}
        }
        this.params = this.props.navigation.state.params
        this.verification = this.params.verification
        this.textInputs = []
    }

    componentWillMount() {

    }

    render() {
        return (
            <KeyboardAvoidingView style = {styles.rootView}
                behavior = { Platform.OS === "ios"? "padding" : null}
                keyboardVerticalOffset = {50}
                >
                <Header hasBack={true} title={this.verification ? 'Get verified' : 'Support'}/>
                 <View style = {this.state.listStyle}>
                    <FlatList
                    ref = {'list'}
                    style = {styles.list}
                    ListHeaderComponent = { () => {return (
                        <View style = {styles.headerContainer}>
                            <Text style = {styles.headerMainText}>
                                {str_support.reportIssueHeader}
                            </Text>
                            <Text style = {styles.headerSubText}>
                                *{str_support.mandatory}
                            </Text>
                        </View>
                    )}}
                    data = {[
                        {
                            key: 'name',
                            title: str_support.nameTitle,
                            placeholder: str_support.namePlaceholder
                        },
                        {
                            key: 'email',
                            title: str_support.emailTitle + '*',
                            placeholder: str_support.emailPlaceholder,
                            email: true
                        },
                        {
                            key: 'subject',
                            title: str_support.subjectTitle + '*',
                            placeholder: str_support.subjectPlaceholder
                        },
                        {
                            key: 'issue',
                            title: str_support.issueTitle,
                            placeholder: str_support.issuePlaceholder,
                            large: true
                        },
                        {
                            key: 'photos',
                            title: str_support.photoTitle,
                            photo: true
                        }
                    ]}
                    renderItem = {({item, index}) => {
                        let required = this.state.required === item.key

                        return (
                            <View style = {styles.listCell}>
                                <Text style = {styles.listCellText}>
                                    {item.title}
                                </Text>
                                {
                                    item.photo ? this.addPhotoView() :

                                    <TextInput
                                    ref = {ti => this.textInputs[index] = ti}
                                    onChangeText = { text => this[item.key] = text }
                                    autoCapitalize = { item.email && 'none' }
                                    autoCorrect = { !item.email }
                                    keyboardType = { item.email && 'email-address' }
                                    onFocus = { () => this.refs.list.scrollToIndex({index}) }
                                    onSubmitEditing = { () => {
                                        if (index+1 < this.textInputs.length) this.textInputs[index+1].focus()
                                    }}
                                    style = {[
                                        styles.listCellInput,
                                        item.large && styles.listCellInputLarge,
                                        required && styles.listCellInputRequired
                                    ]}
                                    multiline =  {item.large}
                                    underlineColorAndroid = 'transparent'
                                    placeholder = {item.placeholder}/>
                                }
                            </View>
                        )
                    }}/>
                    { this.state.sendState !== 'none' && this.sendingIndicator() }
                </View>
            </KeyboardAvoidingView>
        )
    }

    addPhotoView() {
        return  (
            <View style = {styles.addPhotoView}>
                <TouchableOpacity
                onPress = {() => this.pickImage()}>
                    <Image
                    style = {styles.addPhotoButton}/>
                </TouchableOpacity>
                {this.state.photos.map(p => p.thumbnail)}
            </View>
        )
    }

    pickImage() {

        const options = {
            title: 'Select a photo',
            noData: true,
            mediaType: 'photo'
        }

        ImagePicker.launchImageLibrary(options, (response) => {
            
            if (response.didCancel) {

            }
            else if (response.error) {

                Alert.alert(
                    'Alert title',
                    str_support.photosPermissionDenied,
                    [
                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed')},
                        {text: 'OK', onPress: () => Linking.openURL('app-settings:')},
                    ], 
                    { cancelable: false }
                )
            }
            else  {
                let uri = response.uri
                let fileName = response.fileName
                let path = response.path
                this.setState({
                    photos: [...this.state.photos, {uri, path, fileName, thumbnail: this.thumbnailView(uri)}]
                })
            }
        })
    }

    thumbnailView(uri) {
        return (
            <ImageBackground
            source = {{uri}}
            style = {styles.photoThumbnail}
            key = {uri}>
                <TouchableOpacity
                style = {styles.closeTouchable}
                onPress = { () => {
                    let index = this.state.photos.findIndex(p => p.uri === uri)
                    if (index > -1) {
                        let newPhotos = this.state.photos.slice()
                        newPhotos.splice(index, 1)
                        this.setState({ photos: newPhotos })
                    }
                }}>
                    <Image source = {img_intro.closeButton} style = {{tintColor:'red'}}/>
                </TouchableOpacity>
            </ImageBackground>
        )
    }

    sendingIndicator() {
        let sending = this.state.sendState === 'sending'
        let failed = this.state.sendState === 'failed'
        return (
            <View style = {styles.sendIndicator}>
                <Text style = {styles.sendIndicatorTextTop}>
                    { sending? str_support.sendingIndicator : failed? str_support.sendFailIndicator : str_support.sentIndicator} 
                </Text>
                { sending &&
                    <ActivityIndicator
                    style = {{marginBottom: 10}}
                    color = {colors.secondary}
                    size = {'large'}
                    animating = {true}/> 
                }
                <Text style = {styles.sendIndicatorTextBottom}>
                    { sending? str_support.sendingInfo : failed? str_support.sendFailInfo : str_support.sentInfo }
                </Text>
            </View>
        )
    }

    submitForm() {
        if (!this.email) {
            Alert.alert(str_support.noEmailAlertTitle, str_support.noEmailAlertBody)
            this.setState({required: 'email'})
        } 
        else if (!isEmail(this.email)) {
            Alert.alert(str_support.invalidEmailAlertTitle, str_support.invalidEmailAlertBody)
            this.setState({required: 'email'})
        }
        else if (!this.subject) {
            Alert.alert(str_support.noSubjectAlertTitle, str_support.noSubjectAlertBody)
            this.setState({required: 'subject'})
        }
        else {
            Keyboard.dismiss()
            this.setState({sendState: 'sending', required: 'none'})
            FabricSDK.sendSupportRequest({
                name: this.name,
                email: this.email, 
                subject: this.subject,
                issue: this.issue,
                photos: this.state.photos.map((p) => ({uri: p.uri, path: p.path, fileName: p.fileName}))
            })
        }
    }

    onNavigatorEvent(event) {
        if (event.type == 'NavBarButtonPress') { 
            if (event.id == 'back') 
                this.props.navigator.pop()
            else if (event.id == 'submit') {
                this.submitForm()
            }
        }
    }
}

import { connect } from 'react-redux'

export default connect(null, null)(Form)