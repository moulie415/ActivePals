import React, {Component} from 'react';
import {Platform, View, Image as SlowImage} from 'react-native';
import {connect} from 'react-redux';
import Text from '../components/Text';
import Header from '../components/Header/header';

class PersonalTraining extends Component {
  render() {
    return (
      <View>
        <Header title="Personal Training" />
        <Text style={{padding: 10}}>Features coming soon</Text>
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

const mapStateToProps = ({profile, home, friends, sharedInfo}) => ({
  profile: profile.profile,
  feed: home.feed,
  friends: friends.friends,
  users: sharedInfo.users,
});

export default connect(mapStateToProps, null)(PersonalTraining);
