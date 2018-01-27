import React, { Component } from "react"

import {
	Container,
	Card,
	Input,
	Picker,
	ActionSheet,
	Icon,
	Button,
	Content
} from 'native-base'
import {
	Text,
	View,
	TouchableOpacity,
	Alert
} from 'react-native'
import styles from '../styles/sessionDetailStyles'
import Geocoder from 'react-native-geocoder'
import firebase from "Anyone/index"


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
		this.params = this.props.navigation.state.params
		this.type = this.params.type
		this.state = {
			gender: 'All'
		}

	}

	render() {
		return (
			<Container style={{marginHorizontal: 10, flex: 1}}>
				<Content>
					<Input 
					style={{padding: 5, borderWidth: 1, borderColor: '#000', flex: 1, margin: 10}}
					textAlignVertical={'top'}
					onChangeText={title => this.title = title}
					placeholder='Title'/>
					<Input
					style={{padding: 5, borderWidth: 1, borderColor: '#000', flex: 3, margin: 10}}
					placeholder='Details...'
					multiline={true}
					onChangeText={details => this.details = details}
					numberOfLines={7}/>
					<View style={{flex: 2}}>
						<Text style={{fontSize: 30, margin: 10}}>Location</Text>
						<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
							<Input 
							onChangeText={location => this.location = location}
							style={{padding: 5, borderWidth: 1, borderColor: '#000', margin: 10}}
							placeholder='Enter postcode'/>
							<TouchableOpacity>
								<Text style={{color: 'blue', fontSize: 20, margin: 10}}>Select on map</Text>
							</TouchableOpacity>
						</View>
					</View>
					<View style={{flexDirection: 'row'}}>
					<TouchableOpacity 
					style={styles.gender}
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
						<Text style={{fontSize: 15, margin: 10, color: '#fff'}}>{'Gender: ' + this.state.gender}</Text>
					</TouchableOpacity>
					<Text style={styles.typeText}>{'Type: ' + this.type}</Text>
					</View>
					<Button style={styles.createButton}
					onPress={()=> {
						Geocoder.geocodeAddress(this.location).then(res => {
							Alert.alert(res[0].country + " " + res[0].streetName)
							let session = {
								location: {...res[0]}, 
								title: this.title, 
								details: this.details, 
								gender: this.state.gender,
								type: this.type
							}
							firebase.database().ref('sessions').push(session)
						.catch(err => Alert.alert(err.message))
						})
					}}>
						<Text style={{color: '#fff', fontSize: 20}}>Create Session</Text>
					</Button>
				</Content>


			</Container>
			)
	}

}