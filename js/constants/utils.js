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
		source={require('Anyone/assets/images/bicycle.png')} />
	}
	else if (type == 'Custom') {
		return <Image style={{width: size, height: size}}
		source={require('Anyone/assets/images/custom.png')} />
	}
	else if (type == 'Gym') {
		return <Image style={{width: size, height: size}}
		source={require('Anyone/assets/images/dumbbell.png')} />
	}
	else if (type == 'Running') {
		return <Image style={{width: size, height: size}}
		source={require('Anyone/assets/images/running.png')} />
	}
	else if (type == 'Swimming') {
		return <Image style={{width: size, height: size}}
		source={require('Anyone/assets/images/swim.png')} />
	}

}

export function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4()
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
}

export function getResource(type) {
	if (type == 'Cycling') {
		return require('Anyone/assets/images/bicycle.png')
	}
	else if (type == 'Custom') {
		return require('Anyone/assets/images/custom.png')
	}
	else if (type == 'Gym') {
		return require('Anyone/assets/images/dumbbell.png')
	}
	else if (type == 'Running') {
		return require('Anyone/assets/images/running.png')
	}
	else if (type == 'Swimming') {
		return require('Anyone/assets/images/swim.png')
	}

}
