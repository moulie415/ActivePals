import React, { Component } from 'react'
import {
  Image,
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

export function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function extractCreatedTime (item) {
    try {
      return new Date(item.created_at).toISOString()
    } catch (e) {
      console.log(e)
    }
  }

  export function extractUsername(c, uid) {
    try {
      //return c.user && c.user.username && c.user.username !== '' ? JSON.parse(c.user.username) : null
      if (c.user.uid == uid) {
        return 'You'
      }
      return c.user && c.user.username ? c.user.username : null
    } catch (e) {
      console.log(e)
    }
  }

  export function extractBody (c) {
    return c.text
    // try {
    //   return c.body && c.body !== '' ? JSON.parse(c.body) : null
    // } catch (e) {
    //   console.log(e)
    // }
  }

  export function likesExtractor (item, uid, viewProfile, goToProfile) {
    if (item.likes) {
    return item.likes.map((like) => {
      return {
        image: like.image,
        name: like.username,
        user_id: like.user_id,
        like_id: like.user_id,
        tap: (username) => {
          uid == like.user_id ? goToProfile() : viewProfile(like.user_id)
        }
      }
    })
  }
    else return null
  }

  export function extractEditTime (item) {
    try {
      return item.updated_at || new Date(item.created_at).toISOString()
    } catch (e) {
      console.log(e)
    }
  }

  export function extractImage (c) {
    try {
      return c.user.avatar
    } catch (e) {
      console.log(e)
    }
  }

  export function likeExtractor (item) {
    return item.rep
  }

  export function reportedExtractor (item) {
    return item.reported
  }

  export function extractChildrenCount (c) {
    try {
      return c.childrenCount || 0
    } catch (e) {
      console.log(e)
    }
  }
