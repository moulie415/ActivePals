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
      requests: []
    }
  }

  componentDidMount() {

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
        this.friendsRef = firebase.database().ref('users/' + this.user.uid + '/friends')
        this.requestsRef = firebase.database().ref('users/' + this.user.uid + '/requests' )
        this.listenForFriends(this.friendsRef)
        this.listenForRequests(this.requestsRef)
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
        firebase.database().ref('users/' + child.key).once('value')
          .then(snapshot => {
            let user = snapshot.val()
            let pending = user.friends && user.friends[this.user.uid] ? false : true
            friends.push({...user, pending, key: index})
            index++
            this.setState({friends})

          })
          .catch(e => Alert.alert('Error', e.message))
      })
    })
  }

  listenForRequests(ref) {
    ref.on('value', snapshot => {
      let requests = []
      let index = 1
      snapshot.forEach(child => {
        firebase.database().ref('users/' + child.key + '/username').once('value').then(snapshot => {
          requests.push({username: snapshot.val(), key: index})
          index++
          this.setState({requests})
        })
        .catch(e => Alert.alert("Error", e.message))
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
      {this.getRequests(this.state.requests)}
      {this.getFriends(this.state.friends)}
      </ScrollView>
      {this.state.friends.length == 0 && this.state.requests.length == 0 &&
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

  getRequests(requests) {
    let list = []
    let index = 1
    requests.forEach(item => {
      list.push(
          <View key={index}
          style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row'}} >
              <Icon name='ios-contact' />
              <Text>{item.username + ' has sent you a friend request'}</Text>
              <TouchableOpacity>
               <Icon name='checkmark' style={{color: 'green'}}/>
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name='close' style={{color: 'red'}}/>
              </TouchableOpacity>
            </View>
          </View>
        )
      index++
    })
    return list

  }
  getFriends(friends) {
    let list = []
    let index = 1
    friends.forEach(item => {
      if (item.pending) {
        list.push(
          <View key={index}
          style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row'}} >
              <Text>{item.username + ' request sent'}</Text>
            </View>
          </View>
          )
      }
      else {
        list.push(
          <TouchableOpacity key={index}>
          </TouchableOpacity>
          )
      }
      index++
    })
    return list

  }

  sendRequest(username) {
    firebase.database().ref('usernames/' + username).once('value').then(snapshot => {
      let friend = {}
      friend[snapshot.val()] = true
      firebase.database().ref('users/' + this.user.uid + '/friends').set(friend).then(()=> {
        let request = {}
        request[this.user.uid] = true
        firebase.database().ref('users/' + snapshot.val() + '/requests').set(request)
          .then(() => {
            Alert.alert("Success", "Request sent")
          })
          .catch(e => Alert.alert('Error', e.message))
      })
      .catch(e => Alert.alert('Error', e.message))
    })
    .catch(e => Alert.alert("Error", e.message))
  }
}
