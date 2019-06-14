import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default StyleSheet.create({
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
  spinnerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: 250,
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: 5,
    elevation:4,
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "grey",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  button: {
    width: 100,
    alignItems: 'center',
  },
})