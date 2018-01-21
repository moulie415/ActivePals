//icons bicycle football?

import React, { Component } from "react"

import {
	Icon,
	Container
} from 'native-base'
import {
	Image
} from 'react-native'


export default class SessionType extends Component {


	constructor(props) {
		super(props)

	}

	render() {
		return (
			<Container>
				<Image style={{tintColor:'red'}} source={require('../images/dumbbell.png')}/>
				<Icon name='bicycle' style={{fontSize: 50}}/>
				<Image style={{tintColor:'green'}} source={require('../images/running.png')}/>
				<Image style={{tintColor:'blue'}} source={require('../images/soccer.png')}/>

			</Container>
			)
	}

}