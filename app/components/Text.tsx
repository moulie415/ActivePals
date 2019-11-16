import React, { FunctionComponent } from 'react'
import { Text, StyleSheet } from 'react-native'
import TextProps from '../types/components/Text'

export const globalTextStyle = StyleSheet.create({
    app: { fontFamily:'Montserrat' }
})

const AppText:FunctionComponent<TextProps> = ({style, ...rest}) => {
    return <Text style={[style, globalTextStyle.app]} {...rest}/>
}

export default AppText