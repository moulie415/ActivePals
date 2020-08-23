import {
  StyleSheet
} from 'react-native'

export default StyleSheet.create({
  infoRowContainer: {
    padding: 10,
    borderTopColor: '#999',
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  infoRowSpaceEvenly: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center',
  },
})