import React , { Component} from 'react'
import { Image as SlowImage } from 'react-native'
import {
    Platform,
    View
} from 'react-native'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import {
    Container
} from 'native-base'
import TouchableOpacity from './constants/TouchableOpacityLockable'
import Header from './header/header'

class PersonalTraining extends Component {
    
    static navigationOptions = {
        header: null,
        tabBarLabel: 'Training',
        tabBarIcon: ({ tintColor }) => (
          <SlowImage style={{width: 30, height: 30, tintColor, marginBottom: Platform.OS == 'android' ? -7 : 0}}
        source={require('../assets/images/muscle.png')} />
        ),
      }
    constructor(props) {
        super(props)
    }

    render() {
        return <Container>
        <Header title={'Personal Training'}/>
        {!this.props.profile.trainer && <View>
        <Text>Are you a personal trainer? Why not get verified on our platform?</Text>
            <TouchableOpacity onPress={()=> {
                this.props.navigateVerification()
            }}>
                <Text>Get verified</Text>
            </TouchableOpacity></View>}
        </Container>
    }
}



import { connect } from 'react-redux'
import { navigateForm } from './actions/navigation';

const mapStateToProps = ({ profile, home, friends, sharedInfo }) => ({
    profile: profile.profile,
    feed: home.feed,
    friends: friends.friends,
    users: sharedInfo.users,
  })

const mapDispatchToProps = dispatch => ({
    navigateVerification: () => dispatch(navigateForm(true))
})

export default connect(mapStateToProps, mapDispatchToProps) (PersonalTraining)