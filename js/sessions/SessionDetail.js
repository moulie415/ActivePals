import React, { Component } from "react"
import {
	Container,
	Card,
	Picker,
	ActionSheet,
	Icon,
	Button,
	Content,
	Switch
} from 'native-base'
import {
	Text,
	View,
	Alert,
	TextInput,
} from 'react-native'
import styles from '../styles/sessionDetailStyles'
import Geocoder from 'react-native-geocoder'
import firebase from 'react-native-firebase'
import { geofire }  from 'Anyone/index'
import DatePicker from 'react-native-datepicker'
import colors from 'Anyone/js/constants/colors'
import TouchableOpacity from 'Anyone/js/constants/TouchableOpacityLockable'
import RNCalendarEvents from 'react-native-calendar-events'
import { guid } from '../constants/utils'
import Header from '../header/header'


class SessionDetail extends Component {
	static navigationOptions = {
	header: null,
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
		this.buddies = this.params.buddies
		this.location = this.params.location

		this.type = this.params.type
		this.state = {
			gender: 'Unspecified',
			formattedAddress: 'none',
			date: null,
			duration: 1,
			addToCalendar: false
		}

	}

	componentDidMount() {
		if (this.location) {
			let coords = {lat: this.location.geometry.location.lat, lng: this.location.geometry.location.lng}
			this.setLocation(coords, true)
		}
		firebase.auth().onAuthStateChanged( user => {
			if (user) {
				this.user = user
			}
		})

	}

	render() {
		return (
			<Container style={{ flex: 1}}>
			<Header title={'Enter details'} 
				hasBack={true}
			/>
				<Content>
					<TextInput
					style={{padding: 5, borderWidth: 0.5, borderColor: '#999', flex: 1, margin: 10}}
					textAlignVertical={'top'}
					underlineColorAndroid='transparent'
					onChangeText={title => this.title = title}
					placeholder='Title'/>
					<TextInput
					style={{padding: 5, borderWidth: 0.5, borderColor: '#999', height: 100, margin: 10}}
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
						androidMode={'spinner'}
						onDateChange={(date) => {
							this.setState({date})
							console.log(date)
							}}
						confirmBtnText={'Confirm'}
						cancelBtnText={'Cancel'}
						minDate={(new Date()).toISOString()}/>
						<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
							<TouchableOpacity onPress={()=> {
								this.state.duration > 1 && this.setState({duration: this.state.duration-=1})
							}}>
								<Icon name='arrow-dropdown-circle' style={{color: colors.primary, fontSize: 40}}/>
							</TouchableOpacity>
							<Text style={{ width: 50, textAlign: 'center'}}>{this.state.duration + (this.state.duration > 1? ' hrs' :' hr')}</Text>
							<TouchableOpacity onPress={()=> {
								this.state.duration < 24 && this.setState({duration: this.state.duration+=1})
							}}>
								<Icon name='arrow-dropup-circle' style={{color: colors.primary, fontSize: 40}}/>
							</TouchableOpacity>
							
						</View>
						
					</View>
					<View style={{flexDirection: 'row', marginLeft: 10, marginBottom: 20, marginTop: 10}}>
							<Text style={{marginRight: 5}}>Add to calendar</Text>
							<Switch 
							value={this.state.addToCalendar}
							onValueChange={(val)=> {
								this.setState({addToCalendar: val})
								
								if (val) {
									RNCalendarEvents.authorizeEventStore().then(result => {
										if (result == 'authorized') {
											RNCalendarEvents.findCalendars().then(calendars => {
  												let validList = calendars.filter(calendar => calendar.allowsModifications)
												if (validList && validList.length > 0) {
													this.setState({calendarId: validList[0].id})
												}
												else {
													Alert.alert("Sorry", "You don't have any calendars that allow modification")
													this.setState({addToCalendar: false})
												}
											})
										}
										else {
											this.setState({addToCalendar: false})
										}
									})
										
									.catch(e => {
										Alert.alert('Error', error.message)
										this.setState({addToCalendar: false})
									})
								}
								}}
							/>
							</View>


					<View style={{flex: 2, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#999'}}>
						<Text style={{fontSize: 20, margin: 10, fontWeight: 'bold'}}>Location</Text>
						<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
							<TextInput
							onChangeText={postcode => this.postcode = postcode}
							style={{padding: 5, borderWidth: 0.5, borderColor: '#999', margin: 10, flex: 1}}
							underlineColorAndroid='transparent'
							placeholder='Enter postcode'/>
							<TouchableOpacity onPress={()=> {
								if (this.postcode) {
									if (this.validatePostcode(this.postcode)) {
										this.setLocation(this.postcode)
									}
									else {
										Alert.alert("Error", "Postcode is invalid")
									}
								}
							}}
							style={{flex: 1}}>
							<Text style={{color: colors.secondary, fontSize: 20, margin: 10, textAlign: 'center'}}>Submit</Text>
							</TouchableOpacity>
						</View>
						<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
							<TouchableOpacity onPress={()=> this.setLocationAsPosition()}>
								<Text style={{color: colors.secondary, fontSize: 20, margin: 10}}>Use my location</Text>
							</TouchableOpacity>
						</View>
						<Text style={{alignSelf: 'center', margin: 10, fontSize: 15}}>{"Selected location: " + this.state.formattedAddress}</Text>
					</View>
					<View style={{flexDirection: 'row'}}>
					<TouchableOpacity
					style={styles.gender}
					onPress={()=> {
						ActionSheet.show(
						{
							options: ['Unspecified', 'Male', 'Female', 'Cancel'],
							cancelButtonIndex: 3,
							title: "Gender?"
						},
						buttonIndex => {
							switch(buttonIndex) {
								case 0:
									this.setState({gender: 'Unspecified'})
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
					<TouchableOpacity style={styles.createButton}
					onPress={(mutex)=> {
						mutex.lockFor(1000)
						this.createSession()
					}}>
						<Text style={{color: '#fff', fontSize: 20}}>Create Session</Text>
					</TouchableOpacity>
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
				.catch(err => Alert.alert('Error', "Invalid location"))
			}
			else {
				await Geocoder.geocodeAddress(location).then(res => {
					this.location = {...res[0]}
					this.setState({formattedAddress: res[0].formattedAddress})

				})
				.catch(err => Alert.alert('Error', "Invalid location"))
			}
		}
		catch(err) {
			Alert.alert("Error", "Fetching location failed")
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

	createSession() {
		if (this.location && this.title && this.details && this.state.date) {
			let session = {
				location: this.location,
				title: this.title,
				details: this.details,
				gender: this.state.gender,
				type: this.type,
				host: this.user.uid,
				dateTime: this.state.date,
				duration: this.state.duration,
				users: {},
			}
			if (this.buddies) {
				session.private = true
				this.buddies.forEach(uid => {
					session.users[uid] = true
				})
			}
			session.users[this.user.uid] = true

			let type = session.private ? "privateSessions" : "sessions"
			let val = session.private ? "private" : true
			let ref = firebase.database().ref(type).push()
			let key = ref.key
			ref.set(session).then(()=> {
				Alert.alert('Success','Session created')
				this.props.goSessions()
				if (this.buddies) {
					this.buddies.forEach(buddy => {
						firebase.database().ref('users/' + buddy + '/sessions').child(key).set(val)
					})
				}
				firebase.database().ref(type + '/' + key + '/users').child(this.user.uid).set(true)
				firebase.database().ref('users/' + this.user.uid + '/sessions').child(key).set(val)
				let coords = this.location.position
				if (type == 'sessions') {
					geofire.set(key , [coords.lat, coords.lng])
				}
				let systemMessage = {
					_id: 1,
					text: 'Beginning of chat',
					createdAt: new Date().toString(),
					system: true,
				}
				firebase.database().ref('sessionChats/' + key).push(systemMessage)
				this.props.onCreate(key, session.private)
				if (this.state.addToCalendar) {
					let date = new Date(this.state.date.replace(/-/g, '/'))
					let  startDate =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
					date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
					let endDate = new Date(startDate)
					endDate.setHours(endDate.getHours()+this.state.duration)
					RNCalendarEvents.saveEvent(this.title, {
						calendarId: this.state.calendarId,
						startDate: new Date(startDate).toISOString(),
						endDate: endDate.toISOString(),
						location: this.state.formattedAddress,
						notes: this.details,
						description: this.details
					  }) 
				}
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
		let postcode = code.replace(/\s/g, "")
		let regex = /^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i
		return regex.test(postcode)
	}

}

import { connect } from 'react-redux'
import {  navigateSessions } from 'Anyone/js/actions/navigation'
import { addSessionChat } from 'Anyone/js/actions/chats'
import { addPost } from 'Anyone/js/actions/home'

// const mapStateToProps = ({ home, settings }) => ({
// })

const mapDispatchToProps = dispatch => ({
	onCreate: (session, isPrivate) => dispatch(addSessionChat(session, isPrivate)),
	goSessions: ()=> dispatch(navigateSessions()),
	createPost: (post)=> dispatch(addPost(post))
})

export default connect(null, mapDispatchToProps)(SessionDetail)
