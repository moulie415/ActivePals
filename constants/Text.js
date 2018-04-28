import React from 'react'
import { Text, StyleSheet } from 'react-native'

export const globalTextStyle = StyleSheet.create({
    app: { fontFamily:'Avenir' }
})

const AppText = ({...props, style}) => {
    return <Text {...props} style={[style, globalTextStyle.app]}/>
}

export default AppText