import React, { Component } from "react"

import {
	Container,
	Card,
	Input,
	Picker,
	ActionSheet,
	Icon
} from 'native-base'
import {
	Text,
	View,
	TouchableOpacity,
} from 'react-native'


export default class SessionDetail extends Component {
	static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-home'
        style={{ color: tintColor }}
      />
    ),
  }

	constructor(props) {
		super(props)

		this.state = {
			gender: 'All'
		}

	}

	render() {
		return (
			<Container style={{marginHorizontal: 10}}>
				<Card >
					<Input 
					style={{padding: 5, borderWidth: 1, borderColor: '#000', flex: 1, margin: 10}}
					textAlignVertical={'top'}
					placeholder='Title'/>
					<Input
					style={{padding: 5, borderWidth: 1, borderColor: '#000', flex: 3, margin: 10}}
					placeholder='Details...'
					multiline={true}
					numberOfLines={7}/>
					<View style={{flex: 2}}>
						<Text style={{fontSize: 30, margin: 10}}>Location</Text>
						<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
							<Input 
							style={{padding: 5, borderWidth: 1, borderColor: '#000', margin: 10}}
							placeholder='Enter postcode'/>
							<TouchableOpacity>
								<Text style={{color: 'blue', fontSize: 20, margin: 10}}>Select on map</Text>
							</TouchableOpacity>
						</View>
					</View>
					<TouchableOpacity 
					style={{flex: 1}}
					onPress={()=> {
						ActionSheet.show(
						{
							options: ['All', 'Male', 'Female', 'Cancel'],
							cancelButtonIndex: 3,
							title: "Gender?"
						},
						buttonIndex => {
							switch(buttonIndex) {
								case 0:
									this.setState({gender: 'All'})
									break
								case 1:
									this.setState({gender: 'Male'})
									break
								case 2:
									this.setState({gender: 'Female'})
									break
							}
						}
						)
					}}>
						<Text style={{fontSize: 30, margin: 10}}>{'Gender: ' + this.state.gender}</Text>
					</TouchableOpacity>
				</Card>


			</Container>
			)
	}

}