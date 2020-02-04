import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { connect } from 'react-redux';
import Text from '../../components/Text';
import { getType, getSimplifiedTime, sortChatsByDate } from '../../constants/utils';
import colors from '../../constants/colors';
import ChatTabBarIcon from '../../components/ChatTabBarIcon';
import ChatTabLabel from '../../components/ChatTabLabel';
import ChatRowCount from '../../components/ChatRowCount';
import { navigateMessagingSession } from '../../actions/navigation';
import { fetchSessionChats } from '../../actions/chats';

 class SessionChats extends Component {
  static navigationOptions = {
    headerShown: false,
    tabBarLabel: ({tintColor}) => <ChatTabLabel type='Sessions' color={tintColor}/>,
    tabBarIcon: ({ tintColor }) => <ChatTabBarIcon  color={tintColor} />,
  }

  constructor(props) {
    super(props)
    this.nav = this.props.navigation
    this.state = {
      email: "",
      username: "",
      chats: Object.values(this.props.chats),
    }
  }

  render () {
    return (
    <>
    {Object.values(this.props.chats).length > 0 && 
    Object.values(this.props.chats)[0].type ?
        this.renderChats() :
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgColor}}>
            <Text style={{color: colors.primary, textAlign: 'center', marginHorizontal: 20}}>
            You haven't joined any sessions yet, join a session to start a session chat also please make sure you are connected to the internet
          </Text></View>}
    </>
  )
  }

  renderChats() {
    return <FlatList 
      style={{backgroundColor: colors.bgColor}}
      data={sortChatsByDate(Object.values(this.props.chats))}
      keyExtractor={(chat) => chat.key}
      renderItem={({item}) => {
        return <TouchableOpacity
        onPress={()=> {
            this.props.onOpenChat(item)
        }}>
          <View style={{backgroundColor: '#fff', marginBottom: 1, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            <View>{getType(item.type, 50)}</View>
            <View style={{marginHorizontal: 10, flex: 1, justifyContent: 'center'}}>
              <Text style={{color: '#000'}} numberOfLines={1} >{item.title}</Text>
              {!!item.lastMessage.text && <Text numberOfLines={1} style={{color: '#999'}}>{item.lastMessage.text}</Text>}
            </View>
            {item.lastMessage.createdAt && <View style={{marginHorizontal: 10}}>
              <Text style={{color: '#999'}}>{getSimplifiedTime(item.lastMessage.createdAt)}</Text></View>}
              <ChatRowCount id={item.key} />
          </View>
        </TouchableOpacity>
      }}
    />

  }

}

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.sessionChats,
})

const mapDispatchToProps = dispatch => ({
  getChats: (sessions, uid) => dispatch(fetchSessionChats(sessions, uid)),
  onOpenChat: (session) => dispatch(navigateMessagingSession(session)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SessionChats)