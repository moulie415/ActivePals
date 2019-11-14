import {
  StyleSheet
} from 'react-native'

export default StyleSheet.create({
  modal: {
    height: 400,
    width: '90%',
    borderRadius: 10,
  },
})

export const locationSearch = StyleSheet.create({
  textInputContainer: {
    backgroundColor: 'transparent',
    marginHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
  },
  description: {
    fontWeight: 'bold'
  },
  container: {
    top: 20,
  },
  row: {
    width: '90%'
  }
})