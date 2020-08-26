import React, {FunctionComponent} from 'react';
import {TouchableOpacity, Alert} from 'react-native';
import ThemedIcon from '../ThemedIcon/ThemedIcon';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import {SetModal} from '../../actions/friends';
import {connect} from 'react-redux';
import AddFriendButtonProps from '../../types/components/AddFriendButton';

const AddFriendButton: FunctionComponent<AddFriendButtonProps> = ({
  profile,
  setModal,
}) => {
  return (
    <TouchableOpacity
      style={{padding: 10}}
      onPress={() => {
        profile.username
          ? setModal(true)
          : Alert.alert('Please set a username before trying to add a pal');
      }}>
      <ThemedIcon name="person-add" size={30} />
    </TouchableOpacity>
  );
};

const mapStateToProps = ({profile}: MyRootState) => ({
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  setModal: (show: boolean) => dispatch(SetModal(show)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddFriendButton);
