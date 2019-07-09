import React from 'react'
import { Text, StyleSheet } from 'react-native'

export const globalTextStyle = StyleSheet.create({
    app: { fontFamily:'OpenSans' }
})

const AppText = ({style, ...props}) => {
    return <Text {...props} style={[style, globalTextStyle.app]}/>
}

export default AppText