import React, { Component } from 'react'
import {
  View
} from 'react-native'
import {
  Container
} from 'native-base'
import Header from '../components/Header/header'

export default class SessionInfo extends Component {

  render() {
    return <Container style={{flex: 1, backgroundColor: '#9993'}}>
    <Header 
    hasBack={true}
    title={''}
    />
    </Container>
  }
}