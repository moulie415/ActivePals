import React, { Component } from 'react'
import Modal from 'react-native-modalbox'
import styles from './styles'
import  TouchableOpacity from '../TouchableOpacityLockable'
import {
  View,
  Platform,
  Alert,
  ScrollView
} from 'react-native'
import Image from 'react-native-fast-image'
import { Icon } from 'native-base'
import colors from '../../constants/colors'
import Text, { globalTextStyle } from 'Anyone/js/components/Text'
import PropTypes from 'prop-types'
import Button from '../Button'

class FriendsModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedFriends: [],
    }
  }


  render() {
    return <Modal ref={'friendsModal'} 
          onClosed={this.props.onClosed} 
          isOpen={this.props.isOpen} 
          style={styles.modal} 
          position={"center"} >
          <Text style={{fontSize: 20, textAlign: 'center', padding: 10}}>
          Select Pals</Text>
            {this.renderFriendsSelection()}
          <View style={{marginVertical: 10, flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <Button onPress={() => this.props.onClosed()}
            color='red'
            text='Cancel'
            />
  
            <Button onPress={()=> {
              const length = this.state.selectedFriends.length
              if (length > 0) {
                this.props.onContinue(this.state.selectedFriends, this.props.location)
              }
              else {
                Alert.alert("Sorry", "Please select at least one friend")
              }
            }}
            text='Continue'/>
          </View>
        </Modal>
  }


  renderFriendsSelection() {
    const friends = []
    Object.values(this.props.friends).forEach((friend, index) => {
      let selected = this.state.selectedFriends.some(uid => uid == friend.uid)
          if (friend.status == 'connected') {
          friends.push(<TouchableOpacity key={index} onPress={()=> this.onFriendPress(friend.uid)}>
            <View style={{backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 10, marginBottom: 0.5, marginTop: index == 0 ? 0.5 : 0}}>
              <View style={{flexDirection: 'row', alignItems: 'center', height: 30, justifyContent: 'space-between'}} >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {friend.avatar ? <Image source={{uri: friend.avatar}} style={{height: 30, width: 30, borderRadius: 15}}/> :
                  <Icon name='md-contact'  style={{fontSize: 35, color: colors.primary, marginTop: Platform.OS == 'ios' ? -2 : 0}}/>}
                  <Text style={{marginHorizontal: 10}}>{friend.username}</Text>
                  {selected && <Icon name='ios-checkmark-circle' style={{color: colors.primary, textAlign: 'right', flex: 1}} />}
                </View>
              </View>
            </View>
            </TouchableOpacity>)
          }
    })
    return friends.length > 0 ?  
    <ScrollView style={{backgroundColor: '#d6d6d6'}}>{friends}</ScrollView> :  
    <View style={{backgroundColor: '#fff', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{padding: 15, textAlign: 'center'}}>
      {"Sorry, you must have at least one Pal to create a Private Session"}</Text>
    </View>
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

FriendsModal.propTypes = {
  friends: PropTypes.any,
  location: PropTypes.any,
  onContinue: PropTypes.func,
  onClosed: PropTypes.func,
  isOpen: PropTypes.bool
}

import { connect } from 'react-redux'
import { navigateSessionDetail } from '../../actions/navigation'

const mapStateToProps = ({ friends, profile }) => ({
    friends: friends.friends,
    profile: profile.profile
})

const mapDispatchToProps = dispatch => ({
  onContinue: (friends, location) => dispatch(navigateSessionDetail(friends, location)),
})



export default connect(mapStateToProps, mapDispatchToProps)(FriendsModal)

