import React, { Component } from 'react'
import {
    View,
    FlatList,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    Alert,
    TouchableOpacity
} from 'react-native'
import Text, { globalTextStyle } from '../components/Text'
import styles from '../styles/formStyles'
import colors from '../constants/colors'
import Header from '../components/Header/header'

class Form extends Component {



    constructor(props) {
        super(props)
        const gym = this.props.gym
        const name = `${this.props.profile.first_name || ''} ${this.props.profile.last_name}`


        this.state = { 
            sendState:'none',
            name:'',
            email:'',
            subject:'',
            issue:'',
            required:'none',
            listStyle: {flex:1},
            gym: gym ? gym.name : "",
            name: name,

        }
        this.params = this.props.navigation.state.params
        this.verification = this.params.verification
        this.textInputs = []
    }

    componentDidMount() {
       
    }

    render() {
        return (
            <KeyboardAvoidingView style = {styles.rootView}
                behavior = { Platform.OS === "ios"? "padding" : null}
                keyboardVerticalOffset = {50}
                >
                <Header hasBack title={this.verification ? 'Get verified' : 'Support'}/>
                 <View style = {this.state.listStyle}>
                    <FlatList
                    ref = {'list'}
                    style = {styles.list}
                    data = {[
                        {
                            key: 'name',
                            title: 'Name',
                            placeholder: 'Your name'
                        },
                        {
                            key: 'gym',
                            title: 'Gym',
                            placeholder: 'Your gym'
                        },
                        {
                            key: 'rep',
                            title: 'REPs Code',
                            placeholder: 'Your REPs code if you have one'
                        },
                        {
                            key: 'subject',
                            title: 'Subject' ,
                            placeholder: ''
                        },
                        {
                            key: 'details',
                            title: 'Details',
                            placeholder: 'Include any details you think may be relevant',
                            large: true
                        },
                    ]}
                    renderItem = {({item, index}) => {
                        let required = this.state.required === item.key

                        return (
                            <View style = {styles.listCell}>
                                <Text style = {styles.listCellText}>
                                    {item.title}
                                </Text>
                                    {item.key == 'subject' ? 
                                    <Text style={{marginLeft: 5}}>{'Personal trainer verification'}</Text> :
                                    <TextInput
                                    ref = {ti => this.textInputs[index] = ti}
                                    onChangeText = { text => this.setState({[item.key]: text})}
                                    value={this.state[item.key]}
                                    autoCapitalize = { item.email && 'none' }
                                    autoCorrect = { !item.email }
                                    keyboardType = { item.email && 'email-address' }
                                    onFocus = { () => this.refs.list.scrollToIndex({index}) }
                                    onSubmitEditing = { () => {
                                        if (index+1 < this.textInputs.length) this.textInputs[index+1].focus()
                                    }}
                                    style = {[
                                        styles.listCellInput, 
                                        item.large && styles.listCellInputLarge,
                                        required && styles.listCellInputRequired
                                    ]}
                                    multiline =  {item.large}
                                    underlineColorAndroid = 'transparent'
                                    placeholder = {item.placeholder}/>
                                    }
                            </View>
                        )
                    }}/>
                </View>
            </KeyboardAvoidingView>
        )
    }


}

const mapStateToProps = ({ profile  }) => ({
    profile: profile.profile,
    gym: profile.gym
  })


import { connect } from 'react-redux'

export default connect(mapStateToProps, null)(Form)