import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  spinner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  map: {
    flex: 1,
  },
  container: {},
  button: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  modal: {
    width: '90%',
  },
  modalText: {
    color: 'black',
    fontSize: 22,
  },
  btn: {
    margin: 10,
    color: 'white',
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    color: '#000',
    flex: 2,
  },
  date: {
    paddingVertical: 5,
  },
  sessionFilterTitle: {
    fontSize: 20,
    textAlign: 'center',
    paddingBottom: 10,
    fontWeight: 'bold',
  },
  sessionFilterContainer: {
    flex: 1,
    padding: 10,
  },
  infoRowContainer: {
    padding: 10,
    justifyContent: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRowSpaceEvenly: {
    padding: 10,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
