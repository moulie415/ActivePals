import React, { FunctionComponent } from 'react'
import { Text, StyleSheet, TextProperties } from 'react-native'

export const globalTextStyle = StyleSheet.create({
    app: { fontFamily:'Montserrat' }
})

const AppText:FunctionComponent<TextProperties> = (props) => {
    return <Text  style={[props.style, globalTextStyle.app]} {...props}/>
}

export default AppText