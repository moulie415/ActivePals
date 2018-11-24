import {
    StyleSheet
} from 'react-native'
import colors from '../constants/colors'

export default styles = StyleSheet.create({
    wrapper: {
    },
    slide1: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    slide2: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    slide3: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    buttonText: {
      color: colors.secondary,
      fontSize: 75,
    },
    text: {
      padding: 10,
      marginHorizontal: 20,
      color: '#fff',
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center'
    }
  })