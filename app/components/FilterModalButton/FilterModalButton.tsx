import React, {FunctionComponent} from 'react';
import {TouchableOpacity} from 'react-native';
import {Text} from '@ui-kitten/components';
import {MyThunkDispatch} from '../../types/Shared';
import {SetShowFilterModal} from '../../actions/sessions';
import {connect} from 'react-redux';
import FilterModalButtonProps from '../../types/components/FilterModalButton';

const FilterModalButton: FunctionComponent<FilterModalButtonProps> = ({
  setShowFilterModal,
}) => {
  return (
    <TouchableOpacity style={{padding: 10}} onPress={setShowFilterModal}>
      <Text>Filters</Text>
    </TouchableOpacity>
  );
};

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  setShowFilterModal: () => dispatch(SetShowFilterModal(true)),
});

export default connect(null, mapDispatchToProps)(FilterModalButton);
