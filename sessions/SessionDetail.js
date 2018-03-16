import React, { Component } from "react"
import {
	Container,
	Card,
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
	Alert,
	TextInput
} from 'react-native'
import styles from '../styles/sessionDetailStyles'
import Geocoder from 'react-native-geocoder'
import firebase from "Anyone/index"
import DatePicker from 'react-native-datepicker'
import colors from 'Anyone/constants/colors'


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
			gender: 'All',
			formattedAddress: 'none',
			date: null,
			duration: 1
		}

	}

	componentDidMount() {


		firebase.auth().onAuthStateChanged( user => {
			if (user) {
				this.user = user
			}
		})

	}

	render() {
		return (
			<Container style={{marginHorizontal: 10, flex: 1}}>
				<Content>
					<TextInput 
					style={{padding: 5, borderWidth: 1, borderColor: '#000', flex: 1, margin: 10}}
					textAlignVertical={'top'}
					underlineColorAndroid='transparent'
					onChangeText={title => this.title = title}
					placeholder='Title'/>
					<TextInput
					style={{padding: 5, borderWidth: 1, borderColor: '#000', height: 150, margin: 10}}
					placeholder='Details...'
					textAlignVertical={'top'}
					multiline={true}
					underlineColorAndroid='transparent'
					onChangeText={details => this.details = details}/>
					<View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginBottom: 10}}>
					<DatePicker
						date={this.state.date}
						placeholder={"Select date and time"}
						mode={'datetime'}
						onDateChange={(date) => {this.setState({date})}}
						confirmBtnText={'Confirm'}
						cancelBtnText={'Cancel'}
						minDate={(new Date()).toISOString()}/>
						<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
							<TouchableOpacity onPress={()=> {
								this.state.duration > 1 && this.setState({duration: this.state.duration-=1})
							}}>
								<Icon name='arrow-dropdown-circle' style={{color: colors.primary, marginRight: 5, fontSize: 40}}/>
							</TouchableOpacity>
							<Text style={{marginRight: 5, width: 50, textAlign: 'center'}}>{this.state.duration + (this.state.duration > 1? ' hrs' :' hr')}</Text>
							<TouchableOpacity onPress={()=> {
								this.state.duration < 24 && this.setState({duration: this.state.duration+=1})
							}}>
								<Icon name='arrow-dropup-circle' style={{color: colors.primary, fontSize: 40}}/>
							</TouchableOpacity>
						</View>
					</View>


					<View style={{flex: 2, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#999'}}>
						<Text style={{fontSize: 20, margin: 10, fontWeight: 'bold'}}>Location</Text>
						<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
							<TextInput 
							onChangeText={postcode => this.postcode = postcode}
							style={{padding: 5, borderWidth: 1, borderColor: '#000', margin: 10, flex: 1}}
							underlineColorAndroid='transparent'
							placeholder='Enter postcode'/>
							<TouchableOpacity onPress={()=> {
								if (this.validatePostcode(this.postcode)) {
									this.setLocation(this.postcode)
								}
								else {
									Alert.alert("Error", "Postcode is invalid")
								}
							}}
							style={{flex: 1}}>
							<Text style={{color: 'blue', fontSize: 20, margin: 10, textAlign: 'center'}}>Submit</Text>
							</TouchableOpacity>
						</View>
						<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
							<TouchableOpacity onPress={()=> this.setLocationAsPosition()}>
								<Text style={{color: 'blue', fontSize: 20, margin: 10}}>Use my location</Text>
							</TouchableOpacity>
							<TouchableOpacity>
								<Text style={{color: 'blue', fontSize: 20, margin: 10}}>Select on map</Text>
							</TouchableOpacity>
						</View>
						<Text style={{alignSelf: 'center', marginVertical: 10, fontSize: 15}}>{"Selected location: " + this.state.formattedAddress}</Text>
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
					onPress={()=> this.createSession(this.props.navigation)}>
						<Text style={{color: '#fff', fontSize: 20}}>Create Session</Text>
					</Button>
				</Content>


			</Container>
			)
	}

	async setLocation(location, usingPosition = false) {
		try {
			if (usingPosition) {
				await Geocoder.geocodePosition(location).then(res => {
					this.location = {...res[0]}
					this.setState({formattedAddress: res[0].formattedAddress})

				})
				.catch(err => Alert.alert('Error', err.message))
			}
			else {
				await Geocoder.geocodeAddress(location).then(res => {
					this.location = {...res[0]}
					this.setState({formattedAddress: res[0].formattedAddress})

				})
				.catch(err => Alert.alert('Error', err.message))
			}
		}
		catch(err) {
			Alert.alert("Error", err.message)
		}
	}

	setLocationAsPosition() {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				let coords = {lat: position.coords.latitude, lng: position.coords.longitude }
				this.setLocation(coords, true)
			},
			(error) => {
				Alert.alert('Error', error.message)
			},
		{ enableHighAccuracy: true, timeout: 20000, /*maximumAge: 1000*/ },
		)
	}

	createSession(navigation) {
		if (this.location && this.title && this.details && this.state.date) {
			let session = {
				location: this.location, 
				title: this.title, 
				details: this.details, 
				gender: this.state.gender,
				type: this.type,
				host: this.user.uid,
				dateTime: this.state.date,
				duration: this.state.duration
			}
			firebase.database().ref('sessions').push(session).then((snapshot)=> {
				Alert.alert('Success','Session created')
				navigation.navigate("Home")
				firebase.database().ref('users/' + this.user.uid).child('sessions').push(snapshot.key)
			})
			.catch(err => {
				Alert.alert('Error', err.message)
			})
		}
		else {
			Alert.alert('Error', 'Please enter all the necessary fields')
		}

	}

	validatePostcode(code) {
		postcode = code.replace(/\s/g, "")
		let regex = /^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i
		return regex.test(postcode)
	}

}