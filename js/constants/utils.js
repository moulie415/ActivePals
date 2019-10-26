import React, { Component } from 'react'
import {
  Linking,
  Alert
} from 'react-native'
import str from './strings'
import Image from 'react-native-fast-image'
import RNCalendarEvents from 'react-native-calendar-events'

export const types = ['Custom', 'Gym', 'Running', 'Cycling', 'Swimming']

export function getType(type, size, tintColor) {
	if (type == 'Cycling') {
		return <Image tintColor={tintColor} style={{width: size, height: size}}
		source={require('Anyone/assets/images/bicycle.png')} />
	}
	else if (type == 'Custom') {
		return <Image tintColor={tintColor} style={{width: size, height: size}}
		source={require('Anyone/assets/images/custom.png')} />
	}
	else if (type == 'Gym') {
		return <Image tintColor={tintColor} style={{width: size, height: size}}
		source={require('Anyone/assets/images/dumbbell.png')} />
	}
	else if (type == 'Running') {
		return <Image tintColor={tintColor} style={{width: size, height: size}}
		source={require('Anyone/assets/images/running.png')} />
	}
	else if (type == 'Swimming') {
		return <Image tintColor={tintColor} style={{width: size, height: size}}
		source={require('Anyone/assets/images/swim.png')} />
	}
}

export const getMentionsList = (status, friends) => {
  let split = status.split(" ")
  let last = split[split.length - 1]
  let reduced = last.substring(1)
  if (status && last && str.mentionRegex.test(last)) {
    const filtered = friends.filter(friend => {
      return friend.username && 
      friend.username.toLowerCase().includes(reduced.toLowerCase())
    })
    if (filtered.length > 0) {
      return filtered
    }
  } 
  else if (last == "@") {
    return friends
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

export function getSimplifiedTime(createdAt) {
  let timeStamp = new Date(createdAt)

  let now = new Date()
  let today0 = new Date()
  let yesterday0 = new Date(today0.setHours(0,0,0,0))
  yesterday0.setDate(today0.getDate() -1)


  if (timeStamp < yesterday0) dateString = timeStamp.toDateString()
    else if (timeStamp < today0) dateString = 'Yesterday'
      else {
        let minsBeforeNow = Math.floor((now.getTime() - timeStamp.getTime())/(1000*60))
        let hoursBeforeNow = Math.floor(minsBeforeNow/60)
        if (hoursBeforeNow > 0) {
          dateString = hoursBeforeNow+' '+
          (hoursBeforeNow == 1? 'hour' : 'hours')
          +' ago'
        }
        else if (minsBeforeNow > 0) {
          dateString = minsBeforeNow+' '+
          (minsBeforeNow == 1? 'min' : 'mins')
          +' ago'
        } else {
          dateString = 'Just Now'
        }
      }
      return dateString
    }

    export const getStateColor = (state) => {
      switch(state) {
        case 'online':
          return 'green'
        case 'away':
          return '#F9BD49'
        case 'offline':
          return 'red'
      }
    }

    export const getDirections = (gym, yourLocation, selectedLocation, selectedSession) => {
      if (yourLocation) {
        let lat2, lng2
        const lat1 = yourLocation.latitude
        const lng1 = yourLocation.longitude
        if (gym) {
          lat2  = selectedLocation.geometry.location.lat
          lng2 = selectedLocation.geometry.location.lng
        }
        else {
          lat2 = selectedSession.location.position.lat
          lng2 = selectedSession.location.position.lng
        }
        let url = `https://www.google.com/maps/dir/?api=1&origin=${lat1},${lng1}&destination=${lat2},${lng2}`
        Linking.openURL(url).catch(err => console.error('An error occurred', err))
      }
      else {
        Alert.alert('No location found',
          'You may need to change your settings to allow Fit Link to access your location')
      }
    }

    export const getDistance = (item, lat1, lon1, gym = false) =>  {
      if (lat1 && lon1) {
        let lat2
        let lon2
        if (gym) {
          if (item.geometry) {
            lat2 = item.geometry.location.lat
            lon2 = item.geometry.location.lng
          }
          else return 'N/A'
        }
        else {
            lat2 = item.location.position.lat
            lon2 = item.location.position.lng
        }
        let R = 6371
        let dLat = deg2rad(lat2 - lat1)
        let dLon = deg2rad(lon2 - lon1)
        let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        let d = R * c
        return d.toFixed(2)
      }
      else return 'N/A'
    }

    export function deg2rad(deg) {
      return deg * (Math.PI / 180)
    }

    export const addSessionToCalendar = (calendarId, session) => {
      const date = new Date(session.dateTime.replace(/-/g, '/'))
      const startDate =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
      const endDate = new Date(startDate)
      const duration = session.duration + session.durationMinutes/60
      endDate.setHours(endDate.getHours() + duration)
      return RNCalendarEvents.saveEvent(session.title, {
        calendarId,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate.toISOString(),
        location: session.formattedAddress,
        notes: session.details,
        description: session.details
			})
    }

    export const calculateDuration = (data) => {
      const minutes = data.durationMinutes/60 || 0
      const hours = data.duration
      return (minutes + hours)* 60 * 60 * 1000
    }

    export const durationString = (session) => {
      const minutes = session.durationMinutes
      const hours = session.duration
      let string = ' for ' + hours
      hours > 1 ? string += ' hrs ' : string += ' hr '
      if (minutes) {
        string += minutes
        minutes > 1 ? string += ' mins' : ' min'
      }
      return string
    } 
