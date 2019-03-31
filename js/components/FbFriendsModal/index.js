import React, { Component } from 'react'
import Modal from 'react-native-modalbox'
import styles from './styles'
import  TouchableOpacity from '../../constants/TouchableOpacityLockable'
import {
  Text,
  View,
  ScrollView,
  Platform
} from 'react-native'
import Image from 'react-native-fast-image'
import { Icon } from 'native-base'
import colors from '../../constants/colors'

class FbFriendsModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedFriends: []
    }
  }

  render() {
    return <Modal isOpen={this.props.isOpen} style={styles.modal} position={"center"} >
          <Text style={{fontSize: 20, textAlign: 'center', padding: 10, backgroundColor: colors.primary, color: '#fff'}}>
          Select Facebook friends</Text>
          <ScrollView style={{backgroundColor: '#d6d6d6'}}>
          {this.props.friends && this.renderFriendsSelection()}
          </ScrollView>
          <View style={{backgroundColor: colors.primary}}>
            <TouchableOpacity onPress={()=> {
              if (this.state.selectedFriends.length > 0) {
                //send multiple pal requests
              }
              else {
                Alert.alert("Sorry", "Please select at least one pal")
              }
            }}
            style={{padding: 5}}>
              <Text style={styles.button}>
              Send pal requests
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
  }


  renderFriendsSelection() {
    let friends = []
    Object.values(this.props.friends).forEach((friend, index) => {
      let selected = this.state.selectedFriends.some(uid => uid == friend.uid)
      if (friend.username) {
        friends.push(
            <TouchableOpacity key={friend.uid} onPress={()=> this.onFriendPress(friend.uid)}>
            <View style={{backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 10, marginBottom: 0.5}}>
              <View style={{flexDirection: 'row', alignItems: 'center', height: 30, justifyContent: 'space-between'}} >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {friend.avatar ? <Image source={{uri: friend.avatar}} style={{height: 30, width: 30, borderRadius: 15}}/> :
                  <Icon name='md-contact'  style={{fontSize: 35, color: colors.primary, marginTop: Platform.OS == 'ios' ? -2 : 0}}/>}
                  <Text style={{marginHorizontal: 10}}>
                  {friend.username + " " + (friend.first_name ? ("(" + friend.first_name + " " + (friend.last_name || "") + ")") : "")}</Text>
                  {selected && <Icon name='ios-checkmark-circle' style={{color: colors.primary, textAlign: 'right', flex: 1}} />}
                </View>
              </View>
            </View>
            </TouchableOpacity>
            )
      }
  
    })
    return friends
  }

  onFriendPress(uid) {
    if (this.state.selectedFriends.some(friend => friend == uid)) {
      let friends = this.state.selectedFriends.filter(friend => friend != uid)
      this.setState({selectedFriends: friends})
    }
    else {
      this.setState({selectedFriends: [...this.state.selectedFriends, uid]})
    }
  }
}

// const mapStateToProps = ({ profile }) => ({
//   
// })

// const mapDispatchToProps = dispatch => ({
 
// })

import { connect } from 'react-redux'

export default connect(null, null)(FbFriendsModal)

