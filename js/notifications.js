import React, { Component } from "react"
import {
  ImageBackground,
  View,
  ScrollView,
  Alert,
  Linking,
  FlatList
} from "react-native"
import {
  Container,
  Icon,
  Header,
  Title,
  Left,
  Right,
  Spinner
} from "native-base"
import { Image as SlowImage } from 'react-native'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import Image from "react-native-fast-image"
import styles from "./styles/notificationsStyles"
import { formatDateTime, dayDiff } from './constants/utils'
import Swipeout from 'react-native-swipeout'
import TouchableOpacity from './constants/TouchableOpacityLockable'
import colors from './constants/colors'
import { getSimplifiedTime } from './constants/utils'
const weightUp = require('Anyone/assets/images/weightlifting_up.png')


class Notifications extends Component {

  static navigationOptions = {
    header: null,
  }

  constructor() {
    super()
    this.state = {
      close: false,
      spinner: true,
      notifications: {},
      loadingMore: false,
      fetchAmount: 10,
      showLoadMore: false,
    }
  }
  
  componentDidMount() {
    this.props.fetchNotifications()
    this.props.setRead()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({spinner: false})
    if (nextProps.notifications) {
      this.setState({notifications: nextProps.notifications,
        showLoadMore: (Object.values(nextProps.notifications).length == this.state.fetchAmount)
      })
    }
  }

  sortByDate(array) {
    array.sort(function(a,b){
      return new Date(b.date) - new Date(a.date)
    })
    return array
  }

  render() {
    return <Container style={{backgroundColor: '#9993'}}>
      <Header style={{backgroundColor: colors.primary}}>
      <Left style={{flex: 1}}>
          <TouchableOpacity onPress={() => {
            this.props.goBack()
          } }>
            <Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
          </Left>
        <Title style={{alignSelf: 'center', color: '#fff', fontFamily: 'Avenir', flex: 1}}>Notifications</Title>
        <Right />
      </Header>
      {Object.keys(this.state.notifications).length > 0 ?
      <ScrollView>
        {this.renderNotifications()}
      </ScrollView> : this.state.spinner ? <View style={styles.indicator}><Spinner color={colors.secondary}/></View> 
      : <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{textAlign: 'center', color: '#999', fontSize: 20}}>No notifications yet</Text></View> 
         }
    </Container>
  }

  renderNotifications() {
      return <FlatList
        ref={ref => this.flatList = ref}
        data={this.sortByDate(Object.values(this.state.notifications))}
        renderItem={({item}) => {
          let swipeoutBtns = [{
            text: 'Delete',
            backgroundColor: 'red',
            onPress: () => {
              console.log(item)
            }
          }]
          return <Swipeout right={swipeoutBtns} key={item.key} close={this.state.close}> 
          <TouchableOpacity onPress = {(mutex) => {
            mutex.lockFor(1000)
            if (item.postId) {
              this.props.viewPost(item.postId)
            }
          }}>
            <View style={styles.inboxItem}>
              {item.type == 'comment' ? <Icon name={'md-chatboxes'} 
              style={{color: colors.secondary, marginRight: 15, marginLeft: 5}}/> :
              <SlowImage source={weightUp}
             style={{width: 25, height: 25, marginRight: 15, tintColor: colors.secondary}}/>}
              <View style={{flex: 8}}>
                <Text style={{color: '#000', fontSize: 15}}>{this.getNotificationString(item)}</Text>
                <Text style={{color: '#999', fontSize: 12}}>{getSimplifiedTime(new Date(item.date))}</Text>
              </View>
                <Icon name='ios-arrow-forward' style={{color: '#999', textAlign: 'right', marginRight: 10, flex: 1}}/>
            </View>
          </TouchableOpacity>
        </Swipeout>
        }}
        keyExtractor={(item)=> item.key}
        ListFooterComponent={() => {
          if (this.state.showLoadMore) {
            return <TouchableOpacity 
            onPress={()=> {
              this.setState({loadingMore: true, fetchAmount: this.state.fetchAmount + 10}, ()=> {
                this.props.fetchNotifications(this.state.fetchAmount).then(() => {
                  this.setState({loadingMore: false})
                  })
              })
              
            }}
            style={{backgroundColor: '#fff', paddingVertical: this.state.loadingMore ? 0 : 10}}>
              {this.state.loadingMore ? <Spinner color={colors.secondary } size='small' style={{height: 35}} /> : 
              <Text style={{color: colors.secondary, textAlign: 'center'}}>Load More</Text>}
            </TouchableOpacity>
          }
          else return null
        }}
      />
  }

  stringifyDate(date) {
    let diff = dayDiff(date, new Date()) - 1
    if (diff == 0) {
      return 'Today'
    }
    else if (diff == 1) {
      return 'Yesterday'
    }
    else {
      return diff + ' days ago'
    }
  }

  getNotificationString(item) {
    let user
    if (this.props.friends[item.uid]) {
      user = this.props.friends[item.uid].username
    }
    else {
      user = 'Unknown user'
    }
    switch(item.type) {
      case 'postRep':
        return user + ' repped your post'
      case 'commentRep':
        return user + ' repped your comment'
      case 'comment':
        return user + ' commented on your post'
    }
  }

}



import { connect } from 'react-redux'
import { navigateBack, navigatePostView } from 'Anyone/js/actions/navigation'
import { getNotifications, setNotificationsRead } from './actions/home' 

const matchStateToProps = ({profile, home, friends}) => ({
    profile: profile.profile,
    notifications: home.notifications,
    friends: friends.friends
})

 const mapDispatchToProps = dispatch => ({
  onDeleteMessage: (id) => console.log(id),
  onNotificationPress: (id) => console.log(id),
  goBack: () => dispatch(navigateBack()),
  fetchNotifications: (limit = 10) => dispatch(getNotifications(limit)),
  viewPost: (post) => dispatch(navigatePostView(post)),
  setRead: () => dispatch(setNotificationsRead())
 })

export default connect(matchStateToProps, mapDispatchToProps)(Notifications)
