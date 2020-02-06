import React, { Component } from 'react';
import { Platform, View, Image as SlowImage } from 'react-native';
import { connect } from 'react-redux';
import Text, { globalTextStyle } from '../components/Text';
import Header from '../components/Header/header';
import colors from '../constants/colors';

class PersonalTraining extends Component {
  static navigationOptions = {
    headerShown: false,
    tabBarLabel: 'Training',
    tabBarIcon: ({ tintColor }) => (
      <SlowImage
        style={{ width: 30, height: 30, tintColor, marginBottom: Platform.OS == 'android' ? -7 : 0 }}
        source={require('../../assets/images/muscle.png')}
      />
    ),
  };

  render() {
    return (
      <View style={{ backgroundColor: colors.bgColor }}>
        <Header title="Personal Training" />
        <Text style={{ padding: 10 }}>Features coming soon</Text>
        {/* {!this.props.profile.trainer && <View>
        <Text style={{color: colors.secondary, margin: 20, textAlign: 'center'}}>
        Are you a personal trainer? Why not get verified on our platform?
        </Text>
            <Button
            text="Get verified"
            onPress={()=> {
                this.props.navigateVerification()
            }}/>
            </View>} */}
      </View>
    );
  }
}

const mapStateToProps = ({ profile, home, friends, sharedInfo }) => ({
  profile: profile.profile,
  feed: home.feed,
  friends: friends.friends,
  users: sharedInfo.users,
});

export default connect(mapStateToProps, null)(PersonalTraining);
