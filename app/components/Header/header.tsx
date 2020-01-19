import React, { Component, FunctionComponent } from 'react'
import { TouchableOpacity, View, StatusBar, SafeAreaView } from "react-native"
import Text from '../Text'
import Icon from 'react-native-vector-icons/Ionicons'
import { TabBarBottom } from "react-navigation"
import colors from '../../constants/colors'

import globalStyles from '../../styles/globalStyles'

import { connect } from 'react-redux'
import { navigateBack } from '../../actions/navigation'


const AppHeader: FunctionComponent = ({
	hasBack,
	onBackPress,
	customBackPress,
	right,
	title,
	fitTitle,
	backgroundColor,
	left
}) => {
	return <>
			<StatusBar backgroundColor={backgroundColor || colors.primary}/>
			<SafeAreaView style={{backgroundColor:  backgroundColor || colors.primary, height: 90}}>
				<View style = {{flex:1, alignItems: 'center', justifyContent: 'center'}}>
					{left || ((hasBack || customBackPress) &&
							<TouchableOpacity 
								style = {globalStyles.headerLeft}
								onPress = {customBackPress? () => customBackPress(onBackPress) : onBackPress}
							>
						<Icon name='ios-arrow-back' size={25} style={{color: '#fff', padding: 5}} />
					</TouchableOpacity>		
						)}
					<Text adjustsFontSizeToFit={fitTitle} style={{color: 'white', fontWeight:'bold', fontSize: 17, marginHorizontal: 30, textAlign: 'center'}}>{title}</Text>
					{ right &&
						<View style = {{position:'absolute', top:8, bottom:0, right:0, justifyContent: 'center', paddingRight: 10}}>
							{right}
						</View>
					}
				</View>
			</SafeAreaView>
		</>
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
