import React, { Component } from "react"
import { ImageBackground, TouchableOpacity, View } from "react-native"
import Image from "react-native-fast-image"
import Text from '../constants/Text'
import { Icon, Header } from "native-base"
import { TabBarBottom, SafeAreaView } from "react-navigation"
import colors from '../constants/colors'

import styles from "./styles"

import { connect } from 'react-redux'
import { navigateBack } from '../actions/navigation'

const AppHeader = ({ hasBack, onBackPress, customBackPress, right, title, style, fitTitle, backgroundColor, left }) => {
	return <SafeAreaView style={{backgroundColor: backgroundColor || colors.primary}} forceInset={{top:'always'}}>
		<Header
			style = {{backgroundColor: backgroundColor || colors.primary, borderBottomWidth:0, alignItems:'stretch', elevation: 0}}
			androidStatusBarColor={colors.primary}
		>
			<View style = {{flex:1, alignItems: 'center', justifyContent: 'center'}}>
			   	{left || ((hasBack || customBackPress) &&
			      	<TouchableOpacity 
			      		style = {{position:'absolute', top:0, bottom:0, left:0, justifyContent: 'center', paddingLeft: 10}}
			      		onPress = {customBackPress? ()=>customBackPress(onBackPress) : onBackPress}
			      	>
						<Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
					</TouchableOpacity>		
				   )}
		    	<Text adjustsFontSizeToFit={fitTitle} style={{color: 'white', fontWeight:'bold', fontSize: 17}}>{title}</Text>
		    	{ right &&
		    		<View style = {{position:'absolute', top:8, bottom:0, right:0, justifyContent: 'center', paddingRight: 10}}>
		    			{right}
		    		</View>
		    	}
			</View>
		</Header>
	</SafeAreaView>
}

// Connected Header

const mapHeaderDispatchToProps = { onBackPress: navigateBack }
const StyledHeader = connect(null, mapHeaderDispatchToProps)(AppHeader)

// Connected Tab Bar

const mapTabStateToProps = ({settings:{brandInfo}}, {style}) => ({
    style: {...style, backgroundColor: colors.primary },
    indicatorStyle: { backgroundColor: colors.button },
    activeTintColor: colors.button,
    inactiveTintColor: 'white'
})
const StyledTabBar = connect(mapTabStateToProps)(props => <TabBarBottom {...props}/>)

// Connected Header with Connected Tab Bar

const TabBarHeader = (props) => {
	return <View>
	    <StyledHeader {...props}/>
	    <StyledTabBar {...props}/>
	</View>
}

export default StyledHeader
export { StyledTabBar, TabBarHeader }
