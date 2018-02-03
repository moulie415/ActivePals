import React, { Component } from 'react'
import {
	Image
} from 'react-native'

import {
	Icon
} from 'native-base'


export function getType(type, size) {
	if (type == 'Cycling') {
		return <Icon name='bicycle' style={{fontSize: size}} />
	}
	else if (type == 'Custom') {
		return <Icon name='help' style={{fontSize: size}} />
	}
	else if (type == 'Gym') {
		return <Image style={{width: size, height: size}} 
		source={require('../assets/images/dumbbell.png')} />
	}
	else if (type == 'Running') {
		return <Image style={{width: size, height: size}} 
		source={require('../assets/images/running.png')} />
	}

}