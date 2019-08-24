import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  textInputContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderTopColor: '#999',
    borderBottomColor: '#999'
  },
  container: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#fff'
  },
  description: {
    fontWeight: 'bold'
  },
  predefinedPlacesDescription: {
    color: '#1faadb'
  }
})