import React, { Component } from "react"
import {
	Container,
	Icon,
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
import TouchableOpacity from 'Anyone/js/components/TouchableOpacityLockable'
import RNCalendarEvents from 'react-native-calendar-events'
import { types, getType } from '../constants/utils'
import Header from '../components/Header/header'
import MapModal from '../components/MapModal'
import RadioForm from 'react-native-simple-radio-button'
import Button from '../components/Button'
import { addSessionToCalendar } from '../constants/utils'
import NumericInput from 'react-native-numeric-input'

 const genderProps = [
	{label: 'Unspecified', value: 'Unspecified'},
  {label: 'Male', value: 'Male'},
	{label: 'Female', value: 'Female' },
]

const typeProps = types.map(type =>  {
return {	label: type, value: type }
})


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
		this.friends = this.params.friends
		this.location = this.params.location

		this.state = {
			gender: 'Unspecified',
			formattedAddress: 'none',
			date: null,
			duration: 1,
			durationMinutes: 0,
			addToCalendar: false,
			type: 'Custom',
		}

	}

	componentDidMount() {
		if (this.location && this.location.geometry) {
			const coords = {
				lat: this.location.geometry.location.lat,
				lng: this.location.geometry.location.lng,
				gym: this.location.place_id ? this.location: null
			}
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
						style={{padding: 5, borderWidth: 0.5, borderColor: '#999', flex: 1, margin: 10, height: 50}}
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
					<View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginBottom: 10, alignItems: 'center'}}>
					<DatePicker
						date={this.state.date}
						style={{width: '50%'}}
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

					<NumericInput 
            value={this.state.duration} 
            onChange={duration => this.setState({duration})} 
            onLimitReached={(isMax,msg) => console.log(isMax,msg)}
            totalWidth={50} 
            totalHeight={40} 
            iconSize={25}
            step={1}
						type='up-down'
            valueType='integer'
            rounded 
            textColor={colors.secondary}
						maxValue={24}
						minValue={0}
            iconStyle={{ color: 'white' }} 
						upDownButtonsBackgroundColor={colors.secondary}/>
					<Text style={{color: '#999', width: 40, textAlign: 'center'}}>{this.state.duration == 1 ? 'hr' : 'hrs'}</Text>
					<NumericInput 
            value={this.state.durationMinutes} 
            onChange={durationMinutes => this.setState({durationMinutes})} 
            onLimitReached={(isMax,msg) => console.log(isMax,msg)}
            totalWidth={50} 
            totalHeight={40} 
            iconSize={25}
            step={1}
						type='up-down'
            valueType='integer'
            rounded 
            textColor={colors.secondary}
						maxValue={59}
						minValue={0}
            iconStyle={{ color: 'white' }} 
						upDownButtonsBackgroundColor={colors.secondary}/>
					<Text style={{color: '#999', width: 40, textAlign: 'center'}}>{this.state.durationMinutes == 1 ? 'min' : 'mins'}</Text>
					</View>
					<View style={{flexDirection: 'row', marginLeft: 10, marginBottom: 20, marginTop: 10}}>
							<Text style={{marginRight: 5}}>Add to calendar</Text>
							<Switch 
							value={this.state.addToCalendar}
							onValueChange={async (val)=> {
								this.setState({addToCalendar: val})
								try {
									if (val) {
										const result = await RNCalendarEvents.authorizeEventStore()
										if (result == 'authorized') {
											const calendars = await RNCalendarEvents.findCalendars()
											const validList = calendars.filter(calendar => calendar.allowsModifications)
											if (validList && validList.length > 0) {
												this.setState({calendarId: validList[0].id})
											}
											else {
												Alert.alert("Sorry", "You don't have any calendars that allow modification")
												this.setState({addToCalendar: false})
											}
										}
										else {
											this.setState({addToCalendar: false})
										}
									}
									else {
										this.setState({addToCalendar: false})
									}

								} catch(e) {
									Alert.alert('Error', e.message)
									this.setState({addToCalendar: false})
								}
							}}
							/>
							</View>


					<View style={{flex: 2, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#999'}}>
						<Text style={{fontSize: 20, margin: 10, fontWeight: 'bold'}}>Location</Text>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<TextInput
							onChangeText={postcode => this.postcode = postcode}
							style={{padding: 10, borderWidth: 0.5, borderColor: '#999', margin: 10, flex: 1}}
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
							}}>
							<Icon name="md-return-right" 
              style={{
                color: colors.secondary,
                fontSize: 40,
                paddingTop: 5,
								marginHorizontal: 20
                }}/>
							</TouchableOpacity>
						</View>
						<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
							<TouchableOpacity onPress={()=> this.setLocationAsPosition()}>
								<Text style={{color: colors.secondary, fontSize: 20, margin: 10}}>Use my location</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={()=> this.setState({mapOpen: true})}>
								<Text style={{color: colors.secondary, fontSize: 20, margin: 10, textAlign: 'center'}}>Select from map</Text>
							</TouchableOpacity>
						</View>
						<Text style={{alignSelf: 'center', margin: 10, fontSize: 15}}>
						{`Selected location:  ${this.state.gym ? this.state.gym.name : this.state.formattedAddress}`}</Text>
					</View>
					<Text style={{fontSize: 20, margin: 10, fontWeight: 'bold'}}>Gender</Text>
					<RadioForm
					formHorizontal={true}
          radio_props={genderProps}
          initial={0}
					style={{padding: 10, borderBottomWidth: 0.5, borderColor: '#999'}}
					buttonColor={colors.secondary}
					selectedButtonColor={colors.secondary}
					labelStyle={{marginRight: 20}}
          onPress={(value) => {this.setState({gender: value})}}
        	/>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<Text style={{fontSize: 20, margin: 10, fontWeight: 'bold'}}>Type</Text>
						{getType(this.state.type, 20)}
					</View>
					<RadioForm
					formHorizontal={true}
          radio_props={typeProps}
          initial={0}
					style={{padding: 10, borderBottomWidth: 0.5, borderColor: '#999', flexWrap: 'wrap'}}
					buttonColor={colors.secondary}
					selectedButtonColor={colors.secondary}
					labelStyle={{marginRight: 20}}
          onPress={(value) => {this.setState({type: value})}}
        	/>
					<Button
					style={{alignSelf: 'center', marginVertical: 20}}
					textStyle={{fontSize: 20}}
					onPress={(mutex)=> {
						mutex.lockFor(1000)
						this.createSession()
					}}
					text="Create Session"/>
				</Content>

				<MapModal
				isOpen={this.state.mapOpen}
				onClosed={() => this.setState({mapOpen: false})} 
				handlePress={(location) => {
					this.setState({mapOpen: false})
					this.setLocation(location, true)
				}}
				/>
			</Container>
			)
	}

	async setLocation(location, usingPosition = false) {
		try {
			if (usingPosition) {
				await Geocoder.geocodePosition(location).then(res => {
					this.location = {...res[0]}
					this.setState({formattedAddress: res[0].formattedAddress, gym: location.gym})

				})
				.catch(err => Alert.alert('Error', "Invalid location"))
			}
			else {
				await Geocoder.geocodeAddress(location).then(res => {
					this.location = {...res[0]}
					this.setState({formattedAddress: res[0].formattedAddress, gym: location.gym})

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
				const coords = {lat: position.coords.latitude, lng: position.coords.longitude }
				this.setLocation(coords, true)
			},
			(error) => {
				Alert.alert('Error', error.message)
			},
		{ enableHighAccuracy: true, timeout: 20000, /*maximumAge: 1000*/ },
		)
	}

	async createSession() {
		if (this.location && this.title && this.details && this.state.date) {
			const session = {
				location: this.location,
				gym: this.state.gym,
				title: this.title,
				details: this.details,
				gender: this.state.gender,
				type: this.state.type,
				host: this.user.uid,
				dateTime: this.state.date,
				duration: this.state.duration,
				durationMinutes: this.state.durationMinutes,
				users: {},
			}
			if (this.friends) {
				session.private = true
				this.friends.forEach(uid => {
					session.users[uid] = true
				})
			}
			session.users[this.user.uid] = true

			try {
				const type = session.private ? "privateSessions" : "sessions"
				const val = session.private ? "private" : true
				const ref = firebase.database().ref(type).push()
				const key = ref.key
				await ref.set(session)
					Alert.alert('Success','Session created')
					this.props.fetchSessions()
					this.props.goSessions()
					if (this.friends) {
						this.friends.forEach(friend => {
							firebase.database().ref('users/' + friend + '/sessions').child(key).set(val)
						})
					}
					firebase.database().ref(type + '/' + key + '/users').child(this.user.uid).set(true)
					firebase.database().ref('users/' + this.user.uid + '/sessions').child(key).set(val)
					const coords = this.location.position
					if (type == 'sessions') {
						geofire.set(key , [coords.lat, coords.lng])
					}
					const systemMessage = {
						_id: 1,
						text: 'Beginning of chat',
						createdAt: new Date().toString(),
						system: true,
					}
					firebase.database().ref('sessionChats/' + key).push(systemMessage)
					this.props.onCreate(key, session.private)
					if (this.state.addToCalendar) {
						await addSessionToCalendar(this.state.calendarId, session)
					}
			} catch(e) {
				Alert.alert('Error', e.message)
			}
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
import { fetchSessions } from '../actions/sessions'

// const mapStateToProps = ({ home, settings }) => ({
// })

const mapDispatchToProps = dispatch => ({
	onCreate: (session, isPrivate) => dispatch(addSessionChat(session, isPrivate)),
	goSessions: ()=> dispatch(navigateSessions()),
	createPost: (post)=> dispatch(addPost(post)),
	fetchSessions: () => dispatch(fetchSessions())
})

export default connect(null, mapDispatchToProps)(SessionDetail)
