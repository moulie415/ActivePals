import React, { Component } from "react"

import {
	Icon,
	Container,
	Card,
} from 'native-base'
import {
	Image,
	TouchableOpacity,
	Alert
} from 'react-native'
import styles from '../styles/sessionTypeStyles'
import Text, { globalTextStyle } from 'Anyone/constants/Text'


class SessionType extends Component {
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
		this.nav = this.props.navigation
		this.buddies = this.params.buddies
		this.location = this.params.location
	}

	render() {
		return (
			<Container>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} 
				onPress={()=> this.props.onSelect("Gym", this.buddies, this.location)}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/dumbbell.png')}/>
						<Text style={styles.typeText}>Gym</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} 
				onPress={()=> this.props.onSelect("Running", this.buddies, this.location)}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/running.png')}/>
						<Text style={styles.typeText}>Running</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} 
				onPress={()=> this.props.onSelect("Cycling", this.buddies, this.location)}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/bicycle.png')}/>
						<Text style={styles.typeText}>Cycling</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} 
				onPress={()=> this.props.onSelect("Swimming", this.buddies, this.location)}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/swim.png')}/>
						<Text style={styles.typeText}>Swimming</Text>
					</Card>
				</TouchableOpacity>
				<TouchableOpacity style={{flex: 1, marginHorizontal: 10}} 
				onPress={()=> this.props.onSelect("Custom", this.buddies, this.location)}>
					<Card style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<Image style={{height: 50, width: 50}} source={require('../assets/images/custom.png')}/>
						<Text style={styles.typeText}>Custom</Text>
					</Card>
				</TouchableOpacity>

			</Container>
			)
	}

}
import { connect } from 'react-redux'
import { navigateSessionDetail } from 'Anyone/actions/navigation'

const mapDispatchToProps = dispatch => ({
	onSelect: (type, buddies, location) => dispatch(navigateSessionDetail(type, buddies,location))
})

export default connect(null, mapDispatchToProps)(SessionType)



