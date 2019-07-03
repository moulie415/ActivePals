import React from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import Text from '../Text'
import { Icon } from 'native-base'
import styles from './styles'


const ChatTabBarIcon = ({unreadCount, color}) => {
  let count = 0 
  Object.values(unreadCount).forEach(val => count += val)
  return (
    <View>
      <Icon name='md-chatboxes' style={{ color }} />
      {count > 0 && <View style={styles.active}>
				<Text style={styles.unreadCount}>{count > 9 ? '9+' : count}</Text>
			</View>}
    </View>
  )
}

ChatTabBarIcon.propTypes = {
  unreadCount: PropTypes.any,
  color: PropTypes.string
}
import { connect } from 'react-redux'

const mapStateToProps = ({ chats }) => ({
  unreadCount: chats.unreadCount
})

export default connect(mapStateToProps)(ChatTabBarIcon)