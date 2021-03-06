import {StyleSheet, PixelRatio, Platform} from 'react-native';

export default StyleSheet.create({
  commentContainer: {
    paddingRight: 5,
    marginBottom: 10,
    flexDirection: 'row',
  },
  left: {
    padding: 5,
  },
  image: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
  right: {
    flex: 1,
  },
  rightContent: {
    borderRadius: 10,
    padding: 5,
  },
  rightContentTop: {
    flexDirection: 'row',
  },

  name: {
    fontWeight: 'bold',
    paddingBottom: 5,

  },
  editIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },
  body: {
    paddingBottom: 10,
  },
  rightActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 12,
    paddingLeft: 5,

    fontStyle: 'italic',
  },
  actionText: {

    fontWeight: 'bold',
  },
  repliedSection: {
    paddingTop: 15,
    paddingBottom: 20,
    width: 150,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  repliedImg: {
    height: 20,
    width: 20,
    borderRadius: 10,
  },
  repliedUsername: {

  },
  repliedText: {

  },
  repliedCount: {

    fontSize: 11,
  },
  inputSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submit: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: Platform.OS === 'ios' ? 10 : 0,
    marginBottom: Platform.OS === 'ios' ? 0 : 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: 5,
  },
  likeNr: {
    fontWeight: 'normal',
    fontSize: 12,
  },
  likeHeader: {
    textAlign: 'center',
    padding: 10,
    marginTop: 30,
    fontWeight: 'bold',
  },
  likeButton: {
    margin: 10,
    alignItems: 'center',
  },
  likeContainer: {
    padding: 10,
    width: 200,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  likeImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  likename: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  editModalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModal: {
    width: 400,
    height: 300,
    borderWidth: 2,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 40,
    width: 80,
    paddingLeft: 5,
    paddingRight: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
  },
  menu: {
    zIndex: 999,
    borderWidth: StyleSheet.hairlineWidth,
    width: 200,
    right: 0,
    top: 0,

    position: 'absolute',
  },
  menuItem: {
    padding: 10,
    height: 40,
    borderWidth: 0,
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menuText: {
    textAlign: 'center',
  },
  mentionsList: {
    position: 'absolute',
    left: 5,
    right: 5,
    zIndex: 999,
    marginTop: 50,
    elevation: 4,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: 'grey',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
