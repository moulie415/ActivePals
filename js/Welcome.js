import React, { Component } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity
} from 'react-native'
import Swiper from 'react-native-swiper'
import styles from './styles/welcomeStyles'
import colors from './constants/colors'


class Welcome extends Component {
    constructor(props) {
        super(props)
        this.params = this.props.navigation.state.params
        
    }
    render() {
        return (
            <Swiper style={styles.wrapper} showsButtons={true}>
              <View style={styles.slide1}>
                <Text style={styles.text}>Hello Swiper</Text>
              </View>
              <View style={styles.slide2}>
                <Text style={styles.text}>Beautiful</Text>
              </View>
              <View style={styles.slide3}>
                <Text style={styles.text}>And simple</Text>
                <TouchableOpacity 
                style={{backgroundColor: colors.secondary, padding: 10}}
                onPress={()=> this.params.goBack ? this.props.goBack() : this.props.goHome()}>
                    <Text style={{color: '#fff'}}>Finish</Text>
                </TouchableOpacity>
              </View>
            </Swiper>
          )
    }
}


import { connect } from 'react-redux'
import { navigateBack, navigateHome } from 'Anyone/js/actions/navigation'
import { doSetup, fetchProfile, setHasLoggedIn, setLoggedOut } from 'Anyone/js/actions/profile'

// const mapStateToProps = ({  }) => ({

// })

const mapDispatchToProps = dispatch => ({
 goHome: ()=> dispatch(navigateHome()),
 goBack: ()=> dispatch(navigateBack())
})

export default connect(null, mapDispatchToProps)(Welcome)