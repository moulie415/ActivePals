import React, { Component } from "react"
import { 
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  FlatList
} from "react-native"
import { 
  Button,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Header,
  Title,
  Card,
  Left,
  Right,
} from 'native-base'
import firebase from "./index"
import colors from './constants/colors'
import  styles  from './styles/homeStyles'
import Text, { globalTextStyle } from 'Anyone/constants/Text'
import { getSimplified } from 'Anyone/chat/SessionChats'

const weightUp = require('Anyone/assets/images/weightlifting_up.png')
const weightDown = require('Anyone/assets/images/weightlifting_down.png')


class Home extends Component {

  static navigationOptions = {
    header: null,
    tabBarLabel: 'Sessions',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-home'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)

    this.state = {
      profile: this.props.profile,
      feed: this.props.feed,
    }
  }

  componentDidMount() {

  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    this.user = user
    // User is signed in.
  } else {
    // No user is signed in.
  }



})
}

componentWillReceiveProps(nextProps) {
  if (nextProps.profile) {
    this.setState({profile: nextProps.profile})
  }
  if (nextProps.feed) {
    this.setState({feed: nextProps.feed})
  }
}

  render () {
    const { uid, username } = this.props.profile
    return (
    <Container >
      <Header style={{backgroundColor: colors.primary}}>
        <Left style={{flex: 1}}/>
        <Title style={{alignSelf: 'center', color: '#fff', fontFamily: 'Avenir', flex: 1}}>Feed</Title>
        <Right>
          <TouchableOpacity onPress={()=> {
            Alert.alert("coming soon")
          }}>
            <Icon name='ios-notifications' style={{color: '#fff', marginRight: 10}}/>
          </TouchableOpacity>
        </Right>
      </Header>
      <Content>
        <View style={{flexDirection: 'row', backgroundColor: '#fff', padding: 10, alignItems: 'center'}}>
        <TouchableOpacity onPress={()=> this.props.goToProfile()}>
          {this.state.profile && this.state.profile.avatar ?
            <Image source={{uri: this.props.profile.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/>
            : <Icon name='md-contact'  style={{fontSize: 60, color: colors.primary}}/>}
            </TouchableOpacity> 
            <TextInput 
            underlineColorAndroid={"transparent"}
            value={this.state.status}
            autoCorrect={false}
            onChangeText={(status) => this.setState({status})}
            placeholder="Post a status for your buddies..."
            style={{flex: 1, borderColor: '#999', borderWidth: 0.5, marginHorizontal: 10, height: 40, padding: 5}}/>
            <TouchableOpacity onPress={()=> Alert.alert("coming soon")}>
              <Icon name="ios-camera" style={{color: colors.secondary, fontSize: 40, marginRight: 10}} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (this.state.status) {
                if (username) {
                  Alert.alert(
                    "Confirm",
                    "Submit post?",
                    [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'Yes', style: 'positive', onPress: ()=> {
                      this.props.postStatus({type: 'status', text: this.state.status, uid, username, createdAt: (new Date()).toString()})
                      .then(() => this.setState({status: ""}))
                      .catch(e => Alert.alert('Error', e.message))
                    }}
                    ]
                    )
                }
                else {
                  //alert username not set
                }
              }
              else {
                //alert no status
              }
            }}>
              <Icon name="ios-arrow-dropright-circle" style={{color: colors.secondary, fontSize: 40}}/>
            </TouchableOpacity>
        </View>
        {this.props.friends && this.state.profile && this.renderFeed()}
      </Content>
    </Container>
  )
  }

  renderFeed() {
    if (Object.values(this.state.feed).length > 0) {
      return <FlatList
        data={Object.values(this.state.feed).reverse()}
        keyExtractor={(item) => item.key}
        renderItem = {({ item }) => (
            <Card style={{padding: 10, margin: 5}}>
              {this.renderFeedItem(item)}
            </Card>
          )}
      />
    }
    else return <Text style={{fontSize: 20, alignSelf: 'center', marginTop: 20, color: '#999'}}>No feed items yet</Text>
  }
 
  renderFeedItem(item) {
    switch(item.type) {
      case 'status':
        return (
          <View>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <TouchableOpacity onPress={()=> {
            console.log("navigate to profile")
          }}>
            {this.fetchAvatar(item.uid)}
          </TouchableOpacity>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity onPress={()=> {
                  console.log("navigate to profile")
                }}>
                  <Text style={{fontWeight: 'bold', color: colors.secondary, flex: 1}}>
                  {item.uid == this.props.profile.uid ? 'You' : item.username}</Text>
                </TouchableOpacity>
                <Text style={{color: '#999'}}>{getSimplified(item.createdAt)}</Text>
              </View>
              <Text style={{color: '#000'}}>{item.text}</Text>
            </View>
            </View>
            {!!item.repCount && item.repCount > 0 &&
              <View style={{ borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/>}
              {!!item.repCount && item.repCount > 0 && <View style={{marginHorizontal: 10}}>
                  <Text style={{color: '#999'}}>{`${item.repCount} ${item.repCount > 1 ? ' reps' : ' rep'}`}</Text>
                </View>}
            <View style={{borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5}}/>
            {this.repsAndComments(item)}
          </View>
          )
    }
  }

  repsAndComments(item) {
   return(<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
    <TouchableOpacity
      onPress={() => {
        this.props.onRepPost(item)
      }}
      style={{flexDirection: 'row', paddingHorizontal: 50, alignItems: 'center'}}>
      <Image source={item.rep ? weightUp : weightDown}
      style={{width: 25, height: 25, marginRight: 10, tintColor: item.rep ? colors.secondary : '#616770'}}/>
      <Text style={{color: item.rep ? colors.secondary : '#616770'}}>Rep</Text>
    </TouchableOpacity>
    <TouchableOpacity
    onPress={() => {
      Alert.alert('coming soon')
    }}
    style={{flexDirection: 'row', paddingHorizontal: 50, alignItems: 'center'}}>
      <Icon name='md-chatboxes' style={{marginRight: 10, color: '#616770'}}/>
      <Text style={{color: '#616770'}}>Comment</Text>
    </TouchableOpacity>
   </View>)
  }

  fetchAvatar(uid) {
    if (uid == this.props.profile.uid && this.state.profile.avatar) {
      return <Image source={{uri: this.props.profile.avatar}} style={{height: 35, width: 35, borderRadius: 17, marginRight: 10}}/>
    }
    else if (uid != this.props.profile.uid && this.props.friends[uid].avatar) {
      return <Image source={{uri: this.props.friends[uid].avatar}} style={{height: 35, width: 35, borderRadius: 17, marginRight: 10}}/>
    }
    else return <Icon name='md-contact'  style={{fontSize: 45, color: colors.primary, marginRight: 10}}/>
  }


}


import { connect } from 'react-redux'
import { navigateProfile } from 'Anyone/actions/navigation'
import { addPost, repPost } from 'Anyone/actions/home'

const mapStateToProps = ({ profile, home, friends }) => ({
  profile: profile.profile,
  feed: home.feed,
  friends: friends.friends,
})

const mapDispatchToProps = dispatch => ({
  goToProfile: () => dispatch(navigateProfile()),
  postStatus: (status) => {return dispatch(addPost(status))},
  onRepPost: (item) => dispatch(repPost(item)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)