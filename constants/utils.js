import React, { Component } from 'react'
import {
	Image
} from 'react-native'

import {
	Icon
} from 'native-base'


export function getType(type, size) {
	if (type == 'Cycling') {
		return <Image style={{width: size, height: size}} 
		source={require('../assets/images/bicycle.png')} />
	}
	else if (type == 'Custom') {
		return <Image style={{width: size, height: size}} 
		source={require('../assets/images/custom.png')} />
	}
	else if (type == 'Gym') {
		return <Image style={{width: size, height: size}} 
		source={require('../assets/images/dumbbell.png')} />
	}
	else if (type == 'Running') {
		return <Image style={{width: size, height: size}} 
		source={require('../assets/images/running.png')} />
	}
	else if (type == 'Swimming') {
		return <Image style={{width: size, height: size}} 
		source={require('../assets/images/swim.png')} />
	}

}

// export function getResource(type) {
// 	if (type == 'Cycling') {
// 		return require('../assets/images/bicycle.png')
// 	}
// 	else if (type == 'Custom') {
// 		return require('../assets/images/custom.png')
// 	}
// 	else if (type == 'Gym') {
// 		return require('../assets/images/dumbbell.png')
// 	}
// 	else if (type == 'Running') {
// 		return require('../assets/images/running.png')
// 	}
// 	else if (type == 'Swimming') {
// 		return require('../assets/images/swim.png')
// 	}

// }

