import React, { FunctionComponent } from 'react';
import { TouchableOpacity, View, StatusBar, SafeAreaView, Platform } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import globalStyles from '../../styles/globalStyles';
import NavigationService from '../../actions/navigation';
import Text from '../Text';
import HeaderProps from '../../types/components/Header';

const AppHeader: FunctionComponent<HeaderProps> = ({
  hasBack,
  onBackPress,
  customBackPress,
  right,
  title,
  fitTitle,
  backgroundColor,
  left,
}) => {
  return (
    <>
      <StatusBar backgroundColor={backgroundColor || colors.primary} />
      <SafeAreaView
        style={{
          backgroundColor: backgroundColor || colors.primary,
          height: Platform.select({ ios: 90, android: 50 }),
        }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {left ||
            ((hasBack || customBackPress) && (
              <TouchableOpacity
                style={globalStyles.headerLeft}
                onPress={customBackPress ? () => customBackPress(onBackPress) : NavigationService.goBack}
              >
                <Icon name="ios-arrow-back" size={25} style={{ color: '#fff', padding: 5 }} />
              </TouchableOpacity>
            ))}
          <Text
            adjustsFontSizeToFit={fitTitle}
            style={{ color: 'white', fontWeight: 'bold', fontSize: 17, marginHorizontal: 30, textAlign: 'center' }}
          >
            {title}
          </Text>
          {right && (
            <View
              style={{ position: 'absolute', top: 8, bottom: 0, right: 0, justifyContent: 'center', paddingRight: 10 }}
            >
              {right}
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const StyledHeader = connect()(AppHeader);

export default StyledHeader;
