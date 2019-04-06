import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default styles = StyleSheet.create({
  modal: {
    height: 200,
    width: '90%',
  },
  modalText: {
    color: "black",
    fontSize: 22
  },
  usernameInput: {
    borderColor: '#999',
    borderWidth: 1,
    width: 200,
    textAlign: 'center',
    marginVertical: 5,
    padding: 5,
    fontSize: 15,
  },
  button: {
    color: '#fff',
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 5
  },

})