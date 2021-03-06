import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  rootView: {
    flex: 1,
    alignItems: 'stretch',
  },
  list: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
    alignItems: 'center',
  },
  headerMainText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerSubText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 12,
  },
  listCell: {
    alignItems: 'stretch',
    marginBottom: 5,
  },
  listCellText: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 4,
    fontSize: 15,
    paddingLeft: 4,
  },
  listCellInput: {
    textAlignVertical: 'top',
    height: 35,

    borderColor: 'grey',
    borderWidth: 0.5,
    paddingLeft: 6,
    fontSize: 15,
    paddingTop: 6,
    paddingBottom: 6,
  },
  listCellInputRequired: {
    borderWidth: 1,
  },
  listCellInputLarge: {
    height: 200,
  },
  addPhotoView: {
    marginBottom: 10,

    flexDirection: 'row',
    padding: 2,
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  addPhotoButton: {
    resizeMode: 'contain',
    margin: 10,
  },
  photoThumbnail: {
    margin: 1,
    width: 100,
    height: 150,
    alignItems: 'flex-end',
  },
  closeTouchable: {
    margin: 5,
    height: 30,
    width: 30,
    alignItems: 'flex-end',
  },
  sendIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 150,
  },
  sendIndicatorTextTop: {
    color: 'white',
    marginBottom: 10,
    fontWeight: '800',
  },
  sendIndicatorTextBottom: {
    color: 'white',
    width: 200,
    textAlign: 'center',
  },
});
