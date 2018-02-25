import React, { Component } from "react"
import { 
  Alert,
} from "react-native"
import firebase from "Anyone/index"
import { GiftedChat } from 'react-native-gifted-chat'

export default class Messaging extends React.Component {
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.chatId = this.params.chatId
    this.uid = this.params.uid
    this.state = {
      messageObjects: [],
      messages: [],
      user: {}
    }
  }

  componentWillMount() {
    // this.setState({
    //   messages: [
    //     {
    //       _id: this.uid,
    //       text: 'Hello developer',
    //       createdAt: new Date(),
    //       user: {
    //         _id: 2,
    //         name: 'React Native',
    //         avatar: '',
    //       },
    //     },
    //   ],
    // })

  }

  componentDidMount() {
    let ref = firebase.database().ref('chats/'+ this.chatId).child('messages').orderByKey().limitToLast(30)
    this.listenForMessages(ref)
    firebase.database().ref('users/' + this.uid).once('value', snapshot => {
      this.setState({user: snapshot.val()})
    })
  }

  listenForMessages(ref) {
    ref.on('value', snapshot => {
      let messageObjects = []
      snapshot.forEach(child => {
        messageObjects.push({...child.val()})
        this.setState({messageObjects})
      })
      //this.convertMessageObjects()

    })
  }



  convertMessageObjects(){
    let messages = []
    this.state.messageObjects.forEach(item => {
      firebase.database().ref('users/' + item.user._id).once('value', snapshot => {

        let message = {
          ...item,
          user: {
            _id: snapshot.val().uid,
            name: snapshot.val().username
          },
          createdAt: new Date(item.createdAt),
        }
        messages.push(message)
        this.setState({messages})
      })
    })
  }

  onSend(messages = []) {
    //make messages database friendly
    let converted = []
    messages.forEach(message => {
      converted.push({...message, createdAt: message.createdAt.toString()})
    })

    firebase.database().ref('chats/' + this.chatId).child('messages').push(...converted)
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messageObjects, messages),
    }))
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messageObjects.reverse()}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: this.uid,
          name: this.state.user.username
        }}
      />
    )
  }
}