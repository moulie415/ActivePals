import React, { Component } from 'react'
import Modal from 'react-native-modalbox'
import styles from './styles'

class FbFriendsModal extends Component {

  render() {
    <Modal style={styles.modal} position={"center"} ref={"friendsModal"} >
          <Text style={{fontSize: 20, textAlign: 'center', padding: 10, backgroundColor: colors.primary, color: '#fff'}}>
          Select friends</Text>
          <ScrollView style={{backgroundColor: '#d6d6d6'}}>
          {this.renderFriendsSelection()}
          </ScrollView>
          <View style={{backgroundColor: colors.primary}}>
            <TouchableOpacity onPress={()=> {
              if (this.state.selectedFriends.length > 0) {
                this.props.onContinue(this.state.selectedFriends, this.state.selectedLocation)
              }
              else {
                Alert.alert("Sorry", "Please select at least one pal")
              }
            }}
            style={{padding: 5}}>
              <Text style={{color: '#fff', backgroundColor: colors.secondary, alignSelf: 'center', padding: 5, paddingHorizontal: 10}}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Modal>
  }

  renderFriendsSelection() {
    let friends = []
    Object.values(this.props.friends).forEach((friend, index) => {
      let selected = this.state.selectedFriends.some(uid => uid == friend.uid)
      friends.push(
          <TouchableOpacity key={index} onPress={()=> this.onFriendPress(friend.uid)}>
          <View style={{backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 10, marginBottom: 0.5}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 30, justifyContent: 'space-between'}} >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {friend.avatar ? <Image source={{uri: friend.avatar}} style={{height: 30, width: 30, borderRadius: 15}}/> :
                <Icon name='md-contact'  style={{fontSize: 35, color: colors.primary, marginTop: Platform.OS == 'ios' ? -2 : 0}}/>}
                <Text style={{marginHorizontal: 10}}>{friend.username}</Text>
                {selected && <Icon name='ios-checkmark-circle' style={{color: colors.primary, textAlign: 'right', flex: 1}} />}
              </View>
            </View>
          </View>
          </TouchableOpacity>
          )
  
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

export default connect(null, null)(FbFriendsModal)

