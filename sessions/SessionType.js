import React, { Component } from "react"

import {
	Icon,
	Container,
	Card,
} from 'native-base'
import {
	Image,
	TouchableOpacity,
	Text
} from 'react-native'
import styles from '../styles/sessionDetailStyles'


export default class SessionType extends Component {
	static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-home'
        style={{ color: tintColor }}
      />
    ),
  }

	constructor(props) {
		super(props)

		this.nav = this.props.navigation

	}

	render() {
		return (
			<Container>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail')}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/dumbbell.png')}/>
						<Text style={styles.typeText}>Gym?</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail')}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/running.png')}/>
						<Text style={{fontSize: 30, marginLeft: 10}}>Running?</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail')}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name='bicycle' style={{fontSize: 50}}/>
						<Text style={styles.typeText}>Cycling?</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail')}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Text style={styles.typeText}>Custom?</Text>
					</Card>
				</TouchableOpacity>

			</Container>
			)
	}

}