import React, { Component } from "react"
import { 
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Image
} from "react-native"
import {
  Button,
  Text,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Header,
  Title,
  Right,
  Left
} from 'native-base'
import firebase from "./index"
import colors from './constants/colors'
import Modal from 'react-native-modalbox'
import styles from './styles/friendsStyles'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import hStyles from 'Anyone/styles/homeStyles'


 export default class Friends extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Buddies',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-people'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)
    this.nav = this.props.navigation
    this.user = null
    this.state = {
      friends: [],
      users: [],
      refreshing: false
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
        let friendsRef = firebase.database().ref('users/' + this.user.uid + '/friends')
        this.listenForFriends(friendsRef)
      } else {
      }
    })
    FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'))

  }

  listenForFriends(ref) {
    ref.on('value', snapshot => {
      let friends = []
      let i = 1
      snapshot.forEach(child => {
        friends.push({uid: child.key, status: child.val(), key: i})
        this.setState({friends})
        i++
      })
      this.fetchUsers()
    })
  }

  fetchUsers() {
    let users = []
    if (this.state.friends.length > 0) {
      this.state.friends.forEach(friend => {
        firebase.database().ref('users/' + friend.uid).once('value')
        .then(snapshot => {
          firebase.storage().ref('images/' + friend.uid).getDownloadURL()
          .then(image => {
            users.push({...snapshot.val(), status: friend.status, avatar: image})
            this.setState({users})
          })
          .catch(e => {
            users.push({...snapshot.val(), status: friend.status})
            this.setState({users})
          })
        })
        this.setState({refreshing: false})
      })
    }
    else {
      this.setState({refreshing: false})
    }
  }

  _onRefresh() {
    this.setState({refreshing: true});
    this.refreshFriends()
  }


  render () {
    return (
    <Container>
      <Header style={{backgroundColor: colors.primary}}>  
        <Left style={{flex: 1}}>
          </Left>
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff' }}>Buddies</Title>
        <Right style={{flex: 1}}>
          <TouchableOpacity onPress={() => {
        firebase.database().ref('users/' + this.user.uid).child('username')
          .once('value', snapshot => {
            snapshot.val()? this.refs.modal.open() : Alert.alert("Please set a username before trying to add a buddy")
          })
          }}>
            <Icon name='md-add' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
        </Right>
      </Header>
      <Content contentContainerStyle={{flex: 1}}
      refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }>
      {this.state.friends.length > 0 ?
      <ScrollView>
      {this.getFriends()}
      </ScrollView> :
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
            You don't have any buddies yet, also please make sure you are connected to the internet
          </Text></View>}

      <Modal style={styles.modal} position={"center"} ref={"modal"} >
          <Text style={styles.modalText}>Send buddy request</Text>
          <TextInput 
          underlineColorAndroid='transparent'
          style={styles.usernameInput}
          autoCapitalize={'none'}
          placeholder={'Enter username'}
          onChangeText={username => this.username = username}
          />
          <TouchableOpacity onPress={()=> this.sendRequest(this.username)}>
            <Text>Submit</Text>
          </TouchableOpacity>
        </Modal>

        <Modal style={[hStyles.modal, {backgroundColor: colors.primary}]} position={"center"} ref={"profileModal"} isDisabled={this.state.isDisabled}>
        {this.state.selectedUser && <View style={{margin: 10, flex: 1}}>
          <View style={{backgroundColor: '#fff7', padding: 10, marginBottom: 10, borderRadius: 5}}>
            <Text style={{fontFamily: 'Avenir', fontWeight: 'bold', color: '#fff'}}>{this.state.selectedUser.username}</Text>
          </View>
          {(this.state.selectedUser.first_name || this.state.selectedUser.last_name) && 
            <View style={{flexDirection: 'row', backgroundColor: '#fff7', padding: 10, marginBottom: 10, borderRadius: 5}}>
            {this.state.selectedUser.first_name && <Text style={{fontFamily: 'Avenir', color: '#fff'}}>
            {this.state.selectedUser.first_name + ' '}</Text>}
            {this.state.selectedUser.last_name && <Text style={{fontFamily: 'Avenir', color: '#fff'}}>
            {this.state.selectedUser.last_name}</Text>}
          </View>}

          {this.state.selectedUser.birthday && <View style={{backgroundColor: '#fff7', padding: 10, marginBottom: 10, borderRadius: 5}}>
            <Text style={{fontFamily: 'Avenir', color: '#fff'}}>{'Birthday: ' + this.state.selectedUser.birthday}</Text></View>}

          <View style={{backgroundColor: '#fff7', padding: 10, marginBottom: 10, borderRadius: 5}}>
          <Text style={{fontFamily: 'Avenir', color: '#fff'}}>{"Account type: " + 
          this.state.selectedUser.accountType}</Text></View>

            </View>}

        </Modal>
        </Content>
    </Container>
  )
  }


  getFriends() {
    let list = []
    let index = 1
    this.state.users.forEach(friend => {
        if (friend.status == 'outgoing') {
        list.push(
          <View key={index}
          style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row', height: 40, alignItems: 'center'}} >
              <Text style={{marginHorizontal: 10}}>{friend.username + ' request sent'}</Text>
            </View>
          </View>
          )
      }
      else if (friend.status == 'incoming') {
        list.push(
          <View key={index}
          style={{paddingVertical: 20, paddingHorizontal: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 40}} >
              <Text style={{marginHorizontal: 10}}>{friend.username + ' has sent you a buddy request'}</Text>
              <TouchableOpacity onPress={()=> this.accept(friend)}>
               <Icon name='checkmark' style={{color: 'green', fontSize: 30, padding: 5}}/>
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name='close' style={{color: 'red', fontSize: 30, padding: 5}}/>
              </TouchableOpacity>
            </View>
          </View>
        )
      }
      else {
        list.push(
          <View key={index}
          style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 40, justifyContent: 'space-between'}} >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {friend.avatar? <Image source={{uri: friend.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/> :
                <Icon name='md-contact'  style={{fontSize: 60, color: colors.primary}}/>}
                <Text style={{marginHorizontal: 10}}>{friend.username}</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
              <TouchableOpacity 
                onPress={()=> this.openChat(friend.uid, friend.username)}
                style={{padding: 5, marginHorizontal: 5}}>
                <Icon name='md-chatboxes' style={{color: colors.primary, fontSize: 30}}/>
              </TouchableOpacity>
              <TouchableOpacity 
              onPress={()=> this.setState({selectedUser: friend}, ()=> this.refs.profileModal.open())}
              style={{padding: 5, marginHorizontal: 5}}>
                <Icon name='md-person' style={{color: colors.primary, fontSize: 30}}/>
              </TouchableOpacity>
              </View>
            </View>
          </View>
          )
      }
      index++
    })
    return list
  }

  accept(friend) {
    firebase.database().ref('users/' + this.user.uid + '/friends').child(friend.uid).set("connected")
    .then(()=> {
      firebase.database().ref('users/' + friend.uid + '/friends').child(this.user.uid).set("connected")
      .then(() => {
        this.refreshFriends()
      })
    })
    .catch(e => Alert.alert("Error", e.message))

  }

  reject(item) {
    let test = item

  }

  refreshFriends() {
        //refresh friends to display correctly, this could potentially be improved as its a bit hacky
        this.setState({friends: []})
        let friendsRef = firebase.database().ref('users/' + this.user.uid + '/friends')
        this.listenForFriends(friendsRef)
      }

  sendRequest(username) {
    firebase.database().ref('usernames/' + username).once('value').then(snapshot => {
      firebase.database().ref('users/' + this.user.uid + '/friends').child(snapshot.val()).set("outgoing")
      .then(()=> {
        firebase.database().ref('users/' + snapshot.val() + '/friends').child(this.user.uid).set("incoming")
        .then(() => {
          this.refs.modal.close()
          Alert.alert("Success", "Request sent")
        })
      })
    })
    .catch(e => Alert.alert("Error", e.message))
  }

  openChat(uid, username) {
    firebase.database().ref('users/' + this.user.uid + '/chats').child(uid).once('value')
      .then(snapshot => {
        if (snapshot.val()) {
          this.nav.navigate('Messaging', {chatId: snapshot.val(), uid: this.user.uid, friendUid: uid, friendUsername: username})
        }
        else {
          Alert.alert(
            'Start a new chat with ' + username + '?',
            'This will be the beggining of your chat with ' + username,
            [
            {text: 'Cancel', style: 'cancel'},
            {text: 'OK', onPress: () => {
              let timestamp = (new Date()).toString()
              firebase.database().ref('chats').push({_id: 'initial'}).then(snapshot => {
                let chatId = snapshot.key
                firebase.database().ref('chats').child(chatId).push({_id: 'initial'}).then(snapshot => {
                firebase.database().ref('chats').child(chatId).child('_id').remove()
                firebase.database().ref('users/' + this.user.uid + '/chats').child(uid).set(chatId)
                firebase.database().ref('users/' + uid + '/chats').child(this.user.uid).set(chatId)
                this.nav.navigate('Messaging', {chatId, uid: this.user.uid, friendUid: uid, friendUsername: username})
                })
              })

            }
              , style: 'positive'},
            ]
            )
        }
      })
      .catch(e => Alert.alert('Error', e.message))
  }
}
