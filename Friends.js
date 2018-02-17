import React, { Component } from "react"
import { 
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView
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


 export default class Friends extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Friends',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-people'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)

    this.user = null
    this.state = {
      friends: [],
    }
  }

  componentDidMount() {

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
        let friendsRef = firebase.database().ref('users/' + this.user.uid + '/friends')
        this.listenForFriends(friendsRef)
    // User is signed in.
  } else {
    // No user is signed in.
  }
})

  }

  listenForFriends(ref) {
    ref.on('value', snapshot => {
      let friends = []
      let index = 1
      snapshot.forEach(child => {
        firebase.database().ref('users/' + child.key).on('value', snapshot => {
            friends.push({...snapshot.val(), status: child.val(), key: index})
            index++
            this.setState({friends})
          })
      })
    })
  }


  render () {
    return (
    <Container>
      <Header style={{backgroundColor: colors.primary}}>  
        <Left style={{flex: 1}}/>
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff' }}>Friends</Title>
        <Right style={{flex: 1}}>
          <TouchableOpacity onPress={() => this.refs.modal.open() }>
            <Icon name='add' style={{color: '#fff'}} />
          </TouchableOpacity>
        </Right>
      </Header>
      <ScrollView>
      {this.getFriends(this.state.friends)}
      </ScrollView>
      {this.state.friends.length == 0  &&
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>
            No don't have any friends yet, also please make sure you are connected to the internet
          </Text></View>}

      <Modal style={styles.modal} position={"center"} ref={"modal"} >
          <Text style={styles.modalText}>Send friend request</Text>
          <TextInput 
          underlineColorAndroid='transparent'
          style={{borderColor: '#000'}}
          autoCapitalize={'none'}
          placeholder={'Enter username'}
          onChangeText={username => this.username = username}
          />
          <TouchableOpacity onPress={()=> this.sendRequest(this.username)}>
            <Text>Submit</Text>
          </TouchableOpacity>
        </Modal>
    </Container>
  )
  }


  getFriends(friends) {
    let list = []
    let index = 1
    friends.forEach(item => {
      if (item.status == 'outgoing') {
        list.push(
          <View key={index}
          style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row'}} >
              <Text>{item.username + ' request sent'}</Text>
            </View>
          </View>
          )
      }
      else if (item.status == 'incoming') {
        list.push(
          <View key={index}
          style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row'}} >
              <Icon name='ios-contact' />
              <Text>{item.username + ' has sent you a friend request'}</Text>
              <TouchableOpacity onPress={()=> this.accept(item)}>
               <Icon name='checkmark' style={{color: 'green'}}/>
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name='close' style={{color: 'red'}}/>
              </TouchableOpacity>
            </View>
          </View>
        )
      }
      else {
        list.push(
          <TouchableOpacity key={index}
          style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row'}} >
              <Text>{item.username}</Text>
              <TouchableOpacity>
                <Icon name='md-chatboxes' style={{color: colors.primary}}/>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          )
      }
      index++
    })
    return list

  }

  accept(item) {
    // let friend = {}
    // friend[item.uid] = true
    firebase.database().ref('users/' + this.user.uid + '/friends').child(item.uid).set("connected").then(()=> {
      firebase.database().ref('users/' + item.uid + '/friends').child(this.user.uid).set("connected").then(() => {
        //refresh friends to avoid duplicates, this could potentially be improved as its a bit hacky
        this.setState({friends: []})
        let friendsRef = firebase.database().ref('users/' + this.user.uid + '/friends')
        this.listenForFriends(friendsRef)
      })
    })
    .catch(e => Alert.alert("Error", e.message))

  }

  reject(item) {
    let test = item

  }

  sendRequest(username) {
    firebase.database().ref('usernames/' + username).once('value').then(snapshot => {
      let friend = {}
      friend[snapshot.val()] = 'outgoing'
      firebase.database().ref('users/' + this.user.uid + '/friends').set(friend).then(()=> {
        let request = {}
        request[this.user.uid] = 'incoming'
        firebase.database().ref('users/' + snapshot.val() + '/friends').set(request)
        .then(() => {
          Alert.alert("Success", "Request sent")
        })
      })
    })
    .catch(e => Alert.alert("Error", e.message))
  }
}
