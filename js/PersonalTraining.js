import React , { Component} from 'react'
import { Image as SlowImage } from 'react-native'

class PersonalTraining extends Component {
    
    static navigationOptions = {
        header: null,
        tabBarLabel: 'Training',
        tabBarIcon: ({ tintColor }) => (
          <SlowImage style={{width: 30, height: 30, tintColor}}
        source={require('../assets/images/muscle.png')} />
        ),
      }
    constructor(props) {
        super(props)
    }

    render() {
        return null
    }
}



import { connect } from 'react-redux'

export default connect(null, null) (PersonalTraining)