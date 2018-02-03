import { StyleSheet } from "react-native"
import colors from 'Anyone/constants/colors'

export default styles = StyleSheet.create({
  spinner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  map: {
    flex: 1
  },
  container: {
    backgroundColor: colors.primary

  },
  button: {
    borderRadius: 0,
    backgroundColor: colors.secondary,
    flex: 1,
    borderColor: '#fff'
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    width: 300
  },
  modalText: {
    color: "black",
    fontSize: 22
  },
    btn: {
    margin: 10,
    backgroundColor: "#3B5998",
    color: "white",
    padding: 10
  },
  title: {
    fontFamily: 'Avenir',
    fontWeight: 'bold'
  },
  details: {
    fontFamily: 'Avenir',
  }

})