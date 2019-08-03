import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default StyleSheet.create({
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
    borderRadius: 5,
    backgroundColor: colors.secondary,
    flex: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  modal: {
    height: 400,
    width: '90%',
    borderRadius: 10,
    paddingVertical: 10,
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
    fontWeight: 'bold',
    color: '#000',
    flex: 2
  },
  date: {
    fontFamily: 'Montserrat',
    paddingVertical: 5,
  },
  sessionFilterTitle: {
    fontSize: 20,
    textAlign: 'center',
    paddingBottom: 10,
    color: '#000',
    fontWeight: 'bold'
  },
  sessionFilterContainer: {
    flex: 1,
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#999',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#999'
  },
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
  }

})