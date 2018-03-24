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
import styles from '../styles/sessionTypeStyles'


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
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail', {type: 'Gym'})}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/dumbbell.png')}/>
						<Text style={styles.typeText}>Gym</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail', {type: 'Running'})}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/running.png')}/>
						<Text style={styles.typeText}>Running</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail', {type: 'Cycling'})}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name='bicycle' style={{fontSize: 60}}/>
						<Text style={styles.typeText}>Cycling</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail', {type: 'Swimming'})}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/swim.png')}/>
						<Text style={styles.typeText}>Swimming</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} onPress={()=> this.nav.navigate('SessionDetail', {type: 'Custom'})}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Text style={styles.typeText}>Custom</Text>
					</Card>
				</TouchableOpacity>

			</Container>
			)
	}

}