import React, { Component } from "react"
import { StyleSheet, Alert, View } from "react-native"
import { Button, Text, Input, Container, Content,  Item } from 'native-base'
import * as firebase from "firebase"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#002b31"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  input: {
    color: '#fff'
  },
  inputGrp: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 20,
    borderWidth: 0,
    borderColor: 'transparent',
  },
})

 export default class App extends Component {

  constructor(props) {
    super(props)

    this.user = ""
    this.pass = ""
  }

  componentDidMount() {
   let config = {
    apiKey: "AIzaSyDIjOw0vXm7e_4JJRbwz3R787WH2xTzmBw",
    authDomain: "anyone-80c08.firebaseapp.com",
    databaseURL: "https://anyone-80c08.firebaseio.com",
    projectId: "anyone-80c08",
    storageBucket: "anyone-80c08.appspot.com",
    messagingSenderId: "680139677816"
  }
  firebase.initializeApp(config)
}

  render () {
    return (
    <Container style={styles.container}>
      <Text style={styles.welcome}>
        Welcome to React Native Navigation Sample!
      </Text>
      <Item rounded style={styles.inputGrp}>
        <Input
        placeholder="Username"
        onChangeText={u => this.user = u}
        placeholderTextColor="#FFF"
        style={styles.input}
        autoCapitalize={'none'}
        autoCorrect={false}
        //value={this.state.username}
        keyboardType={'email-address'}
        />
        </Item>
      <Item rounded style={styles.inputGrp}>
      <Input
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor="#FFF"
        onChangeText={p => this.pass = p}
        style={styles.input}
        />
        </Item>
        <View style={{flexDirection: 'row'}}>
      <Button primary rounded
        onPress={() => this.login(this.user, this.pass)}
        style={{alignSelf: 'center'}}
        >
        <Text>Login</Text>
        </Button>
      <Button primary rounded
        onPress={() => this.props.navigation.navigate("SignUp")}
        style={{alignSelf: 'center'}}
        >
        <Text>Sign Up</Text>
        </Button>
        </View>
    </Container>
  )
  }

    async signup(email, pass) {
      try {
        await firebase.auth()
        .createUserWithEmailAndPassword(email, pass)

        console.log("Account created")
        Alert.alert("account created")
      } catch (error) {
        console.log(error.toString())
      }
}

//   async login(email, pass) {
    
//     try {
//         await firebase.auth()
//             .signInWithEmailAndPassword(email, pass);

//         console.log("Logged In!")
//         Alert.alert("logged in")

//         // Navigate to the Home page

//     } catch (error) {
//         Alert.alert(error.toString())
//     }

// }

} 
