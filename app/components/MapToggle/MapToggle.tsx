import React, {FunctionComponent} from 'react';
import {View} from 'react-native';
import {Toggle, Text} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import {SetShowMap} from '../../actions/sessions';
import {connect} from 'react-redux';
import MapToggleProps from '../../types/components/MapToggle';

const MapToggle: FunctionComponent<MapToggleProps> = ({
  showMap,
  setShowMap,
}) => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 10}}>
      <Text>Map: </Text>
      <Toggle checked={showMap} onChange={setShowMap} />
    </View>
  );
};

const mapStateToProps = ({sessions}: MyRootState) => ({
  showMap: sessions.showMap,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  setShowMap: (show: boolean) => dispatch(SetShowMap(show)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MapToggle);
