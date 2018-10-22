import React, { Component } from 'react'
import {
  Image,
} from 'react-native'

import {
	Icon
} from 'native-base'
import str from './strings'


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

  export function formatDateTime(dateTime) {
    dateTime = dateTime.replace(/-/g, "/")
    let date = new Date(dateTime)
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12
    minutes = minutes < 10 ? '0' + minutes : minutes
    let strTime = hours + ':' + minutes + ampm
    let day = date.getDate()
    return `${str.days[date.getDay()].toString()} ${day.toString() + nth(day)} ${str.months[date.getMonth()].toString()} ${strTime}`
  }

  export function nth(d) {
  if (d > 3 && d < 21) return 'th'
  switch (d % 10) {
        case 1:  return "st"
        case 2:  return "nd"
        case 3:  return "rd"
        default: return "th"
    }
}

export function dayDiff(first, second, round = true) {
  let start = new Date(first)
  let end = new Date(second)
  let timeDiff = Math.abs(end.getTime() - start.getTime())
  if (round) {
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }
  else return (timeDiff / (1000 * 3600 * 24))
}
