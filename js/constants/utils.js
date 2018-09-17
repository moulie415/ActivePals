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

export function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function extractCreatedTime (item) {
    try {
      return item.created_at
    } catch (e) {
      console.log(e)
    }
  }

  export function extractUsername(c) {
    try {
      //return c.user && c.user.username && c.user.username !== '' ? JSON.parse(c.user.username) : null
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

  export function likesExtractor (item) {
    return [{},{},{}]
    // return item.likes.map((like) => {
    //   return {
    //     image: this.config.urls.api_url+'/data/images/users/'+like.user_id+'/'+like.user.image,
    //     name: JSON.parse(like.user.name),
    //     user_id: like.user_id,
    //     tap: (username) => {
    //     }
    //   }
    // })
  }

  export function extractEditTime (item) {
    try {
      return item.updated_at
    } catch (e) {
      console.log(e)
    }
  }

  export function extractImage (c) {
    try {
      return c.user.image_id && c.user.image_id !== '' ? this.config.urls.api_url +
        '/data/images/users/' + c.user.image_id : this.config.urls.api_url +
        '/data/images/users/no_image.png'

    } catch (e) {
      console.log(e)
    }
  }

  export function likeExtractor (item) {
    return item.hasUserLiked
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
