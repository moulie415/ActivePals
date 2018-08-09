import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
  input: {
    color: '#fff',
    fontFamily: 'Avenir',
  },
  inputGrp: {
    flexDirection: 'row',
    backgroundColor: '#0005',
    marginBottom: 20,
    borderWidth: 0,
    borderColor: 'transparent',
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 10,
    borderRadius: 3,

  },
  button: {
    backgroundColor: colors.secondary,
    width: 100, justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 2
  }
})