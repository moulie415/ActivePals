import React from 'react'
import ParsedText from 'react-native-parsed-text'
import str from '../../constants/strings'
import colors from '../../constants/colors'
import PropTypes from 'prop-types'
import firebase from 'react-native-firebase'

const CustomParsedText = ({text, friends, users, profile, goToProfile, viewProfile}) => {
  return <ParsedText 
    style={{color: '#000'}}
    parse={
      [
        {pattern: str.mentionRegex, style: {color: colors.secondary}, onPress: async (mention) => {
          const name = mention.substring(1)
          const combined = [...Object.values(friends), ...Object.values(users)]
          if (name == profile.username) {
            goToProfile()
          }
          else {
            const found = combined.find(friend => friend.username == name)
            if (found) {
              viewProfile(found.uid)
            }
            else {
              try {
                const snapshot = await firebase.database().ref('usernames').child(name).once('value')
                if (snapshot.val()) {
                  viewProfile(snapshot.val())
                }
              } catch(e) {
                console.warn(e.message)
              }
            }
          }
        }}
      ]
    }
    >{text}
    </ParsedText>
}

CustomParsedText.propTypes = {
  text: PropTypes.string,
  profile: PropTypes.any,
  friends: PropTypes.any,
  users: PropTypes.any,
  goToProfile: PropTypes.func,
  viewProfile: PropTypes.func
}

import { connect } from 'react-redux'
import { navigateProfileView, navigateProfile } from '../../actions/navigation'

const mapStateToProps = ({ profile, friends, sharedInfo }) => ({
  profile: profile.profile,
  friends: friends.friends,
  users: sharedInfo.users,
})

const mapDispatchToProps = dispatch => ({
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  goToProfile: () => dispatch(navigateProfile()),
})

export default connect(mapStateToProps, mapDispatchToProps)(CustomParsedText)


