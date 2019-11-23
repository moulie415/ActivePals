import React, { FunctionComponent } from 'react'
import { View } from 'react-native'
import Text from '../Text'
import styles from './styles'


const ChatRowCount: FunctionComponent = ({unreadCount, id}) => {
  const count = unreadCount[id]
  
  if (count && count > 0) {
    return (
        <View style={styles.countContainer}>
          <Text style={styles.count}>{count > 9 ? '9+' : count}</Text>
        </View>
    )
  }
  else return null
}

import { connect } from 'react-redux'

const mapStateToProps = ({ chats }) => ({
  unreadCount: chats.unreadCount,
})

export default connect(mapStateToProps)(ChatRowCount)