import React, { Component } from "react"
import { 
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  Image,
  Platform
} from "react-native"
import {
  Button,
  Input,
  Container,
  Content, 
  Item,
  Icon,
  Header,
  Left,
  Title,
  Right,
  ActionSheet,
  Spinner
} from 'native-base'
import firebase from './index'
import Text, { globalTextStyle } from 'Anyone/constants/Text'
import  styles  from './styles/profileStyles'
import colors from './constants/colors'
import DatePicker from 'react-native-datepicker'
var ImagePicker = require('react-native-image-picker')
import ImageResizer from 'react-native-image-resizer'
import RNFetchBlob from 'react-native-fetch-blob'
import { NavigationActions } from "react-navigation"


// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

 class Profile extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-person'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)
    this.profile = this.props.profile

    this.database = firebase.database().ref('users')
    this.user = null
    this.state = {
      email: this.profile.email,
      profile: this.profile,
      initialProfile: this.profile,
      spinner: false,
      initialAvatar: this.profile.avatar,
      avatar: this.profile.avatar
    }
  }


  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        this.props.onLogoutPress()
      }
    })  
    this.listenForUserChanges(firebase.database().ref('users/' + this.profile.uid))
  }

  listenForUserChanges(ref) {
    ref.on("value", snapshot => {
      let profile = snapshot.val()
      this.setState({initialProfile: profile})
      this.setState({profile})
    })

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.profile) {
      let profile = nextProps.profile
      this.setState({profile, initialProfile: profile, initialAvatar: profile.avatar})
    }
  }


  render () {
    return (
    <Container>
    <Header style={{backgroundColor: colors.primary}}>
        <Left style={{flex: 1}} >
        {this.hasChanged() && <TouchableOpacity
            onPress={() => {
              this.setState({profile: this.state.initialProfile, avatar: this.state.initialAvatar})
          }}>
            <Text style={{color: '#fff'}}>UNDO</Text>
          </TouchableOpacity>}
        </Left>
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff'}}>Profile</Title>
        <Right>
          <Button onPress={()=> this.updateUser(this.state.initialProfile, this.state.profile)}
          style={{backgroundColor: 'transparent', elevation: 0}}>
            <Text style={{color: '#fff'}}>SAVE</Text>
          </Button>
        </Right>

        </Header>
        
      <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
        {this.state.avatar ? 
          <TouchableOpacity 
          style={{marginHorizontal: 20}}
          onPress={()=> this.selectAvatar()}>
            <Image style={{height: 90, width: 90, borderRadius: 5}}
            source={{uri: this.state.avatar}} />
          </TouchableOpacity>
         : <TouchableOpacity
        onPress={()=> this.selectAvatar()}
        style={{marginHorizontal: 20, backgroundColor: '#fff7', borderRadius: 5, width: 90, height: 90, justifyContent: 'center'}}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Icon name='md-contact'  
          style={{fontSize: 80, color: colors.primary, textAlign: 'center', 
          marginBottom: Platform.OS == 'ios' ? -5 : null}}/>
          </View>
          </TouchableOpacity>}
        <View style={{flex: 1, marginRight: 10}}>
            <Text style={{color: '#999'}}>Email: <Text style={{color: colors.secondary}}>{this.state.email}</Text></Text>
            <Text style={{color: '#999'}}>Account type: <Text style={{color: colors.secondary}}>{this.state.profile.accountType}</Text></Text>
        </View>

      </View>


      <View style={styles.inputGrp}>
        <Text style={{alignSelf: 'center'}}>Username: </Text>
            <Input
            value={this.state.profile.username}
            onChangeText={username => this.setState({profile: {...this.state.profile, username}})}
            placeholderTextColor="#fff"
            style={styles.input}
            autoCapitalize={'none'}
            autoCorrect={false}
        />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>First name: </Text>
            <Input
            value={this.state.profile.first_name}
            onChangeText={name => this.setState({profile: {...this.state.profile, first_name: name}})}
            placeholderTextColor="#fff"
            style={styles.input}
            autoCapitalize={'none'}
            autoCorrect={false}
        />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>Last name: </Text>
            <Input
            value={this.state.profile.last_name}
            onChangeText={name => this.setState({profile: {...this.state.profile, last_name: name}})}
            placeholderTextColor="#fff"
            style={styles.input}
            autoCapitalize={'none'}
            autoCorrect={false}
        />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>Birthday: </Text>
          <DatePicker
          date={this.getDate(this.state.profile.birthday)}
          placeholder={this.state.profile.birthday || 'None'}
          maxDate={new Date()}
          confirmBtnText={'Confirm'}
          androidMode={'spinner'}
          cancelBtnText={'Cancel'}
          customStyles={{
            dateText: {
              color: '#fff',
            },
            placeholderText: {
              color: '#fff',
            },
            dateInput: {
              borderWidth: 0,
            }
          }}
          onDateChange={(date) => this.setState({profile: {...this.state.profile, birthday: date}})}
          />
          </View>
          <TouchableOpacity 
          style={{flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: colors.secondary, paddingVertical: 10}} 
          onPress={()=> this.props.goToSettings()}>
            <Icon
            name='md-settings'
            style={{ color: colors.secondary, marginLeft: 20}}
            />
            <Text style={{color: colors.secondary, alignSelf: 'center', marginLeft: 20}}>Settings</Text>
          </TouchableOpacity>

      <TouchableOpacity
        style={{backgroundColor: colors.secondary, marginTop: 20, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20}}
        onPress={()=> this.logout()}>
        <Text style={{color: '#fff'}} >Log out</Text>
      </TouchableOpacity>
        {this.state.spinner && <Spinner color={colors.secondary}/>}

    </Container>
  )
  }

  getDate(date) {
    if (date) {
      let formatted = date.replace(/-/g, "/")
      return new Date(formatted)
    }
    else return null
  }

updateUser(initial, profile) {
  if (!this.hasChanged()) {
    Alert.alert("No changes")
  }
  else {
    if (profile.username.length < 5) {
      Alert.alert('Sorry', 'Username must be at least 5 characters long')
    }
    else {
      this.setState({spinner: true})
      if (this.state.initialAvatar != this.state.avatar) {
        this.uploadImage(this.state.avatar).then((url)=> {
          this.checkUsername(initial, profile)
          this.setState({initalAvatar: url})
        })
        .catch(e => {
          this.setState({spinner: false})
          Alert.alert('Error', e.message)
        })
      }
      else {
        this.checkUsername(initial, profile)
      }
    }
  }
  this.props.onSave()
}

checkUsername(initial, profile){
  delete profile.avatar
  firebase.database().ref('users/' + this.profile.uid).set({...profile})
  .then(()=> {
    initial.username && firebase.database().ref('usernames').child(initial.username).remove()
    firebase.database().ref('usernames').child(profile.username).set(profile.uid)
    .then(() => {
      Alert.alert("Success", 'Profile saved')
      this.setState({spinner: false})
    })
  })
  .catch(e => {
    Alert.alert('Error', e.message + "\nthat username may have already been taken")
    this.setState({spinner: false})
  })
}

hasChanged() {
  return !((JSON.stringify(this.state.initialProfile) === JSON.stringify(this.state.profile)
    && (this.state.initialAvatar == this.state.avatar)))
}

selectAvatar() {
  var options = {
    title: 'Select Avatar',
    mediaType: 'photo',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  }
  ImagePicker.showImagePicker(options, (response) => {
    console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled image picker');
    }
    else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    }
    else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    }
    else {
      let source = { uri: response.uri };

    // You can also display the image using data:
    // let source = { uri: 'data:image/jpeg;base64,' + response.data };
    ImageResizer.createResizedImage(response.uri, 200, 200, 'PNG', 100).then((resized) => {
      // response.uri is the URI of the new image that can now be displayed, uploaded...
      // response.path is the path of the new image
      // response.name is the name of the new image with the extension
      // response.size is the size of the new image
      this.setState({avatar: resized.uri})

    }).catch((err) => {
      Alert.alert(err.message)
    })

  }
})
}


  uploadImage(uri, mime = 'application/octet-stream') {
    return new Promise((resolve, reject) => {
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      let uploadBlob = null

      const imageRef = firebase.storage().ref('images/' + this.profile.uid).child('avatar')

      fs.readFile(uploadUri, 'base64')
        .then((data) => {
          return Blob.build(data, { type: `${mime};BASE64` })
        })
        .then((blob) => {
          uploadBlob = blob
          return imageRef.put(blob, { contentType: mime })
        })
        .then(() => {
          uploadBlob.close()
          return imageRef.getDownloadURL()
        })
        .then((url) => {
          resolve(url)
        })
        .catch((error) => {
          reject(error)
      })
    })
  }

 

  logout() {
    firebase.auth().signOut().then(function() {
    }, function(error) {
      Alert.alert(error.toString())
    })
  }
}


import { connect } from 'react-redux'
import { navigateLogin, navigateSettings } from 'Anyone/actions/navigation'
import { fetchProfile } from 'Anyone/actions/profile'

const mapStateToProps = ({ profile }) => ({
  profile: profile.profile,
})

const mapDispatchToProps = dispatch => ({
  onLogoutPress: ()=> { dispatch(navigateLogin())},
  onSave: ()=> dispatch(fetchProfile()),
  goToSettings: ()=> dispatch(navigateSettings()),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
