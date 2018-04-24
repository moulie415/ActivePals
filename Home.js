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
  Text,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Header,
  Title,
} from 'native-base'
import firebase from "./index"
import colors from './constants/colors'
import  styles  from './styles/homeStyles'


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
      profile: this.props.profile
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
}

  render () {
    return (
    <Container >
      <Header style={{backgroundColor: colors.primary}}>
        <Title style={{alignSelf: 'center', color: '#fff', fontFamily: 'Avenir'}}>Feed</Title>
      </Header>
      <Content>
        <View style={{flexDirection: 'row', backgroundColor: '#fff', marginBottom: 10, padding: 10, alignItems: 'center'}}>
        <TouchableOpacity onPress={()=> this.props.goToProfile()}>
          {this.state.profile.avatar? 
            <Image source={{uri: this.props.profile.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/>
            : <Icon name='md-contact'  style={{fontSize: 60, color: colors.primary}}/>}
            </TouchableOpacity> 
            <TextInput 
            underlineColorAndroid={"transparent"}
            onChangeText={(status) => this.setState({status})}
            placeholder="Post a status for your buddies..."
            style={{flex: 1, borderColor: '#999', borderWidth: 0.5, marginHorizontal: 10, height: 40, padding: 5}}/>
            <TouchableOpacity onPress={() => {
              if (this.state.status) {
                this.props.postStatus({type: 'status', text: this.state.status})
              }
            }}>
              <Icon name="ios-arrow-dropright-circle" style={{color: colors.secondary, fontSize: 40}}/>
            </TouchableOpacity>
        </View>
      </Content>
    </Container>
  )
  }
  
}


import { connect } from 'react-redux'
import { navigateProfile } from 'Anyone/actions/navigation'
//import {  } from 'Anyone/actions/chats'

const mapStateToProps = ({ friends, profile, chats }) => ({
  profile: profile.profile,


})

const mapDispatchToProps = dispatch => ({
  goToProfile: () => dispatch(navigateProfile()),
  postStatus: (status) => dispatch(fanoutPost(status))
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)