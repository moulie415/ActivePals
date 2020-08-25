import React, {FunctionComponent, useState, useContext} from 'react';
import {View, Alert, ScrollView, ActivityIndicator} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import VersionNumber from 'react-native-version-number';
import DialogInput from 'react-native-dialog-input';
import Instabug from 'instabug-reactnative';
import {connect} from 'react-redux';
import styles from '../styles/settingsStyles';
import FbFriendsModal from '../components/FbFriendsModal';
import {removeUser} from '../actions/profile';
import SettingsProps from '../types/views/Settings';
import {AccountType} from '../types/Profile';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import {Layout, Toggle, ListItem, Divider} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import {ThemeContext} from '../context/themeContext';

const Settings: FunctionComponent<SettingsProps> = ({
  profile,
  onRemoveUser,
  navigation,
}) => {
  const [spinner, setSpinner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [fbModalOpen, setFbModalOpen] = useState(false);

  const {theme, toggleTheme} = useContext(ThemeContext);

  return (
    <Layout style={styles.container}>
      <ScrollView>
        <ListItem
          title="Contact Support"
          onPress={() => {
            Alert.alert('coming soon');
            // Linking.openURL('mailto:fitlink-support@gmail.com')
          }}
          accessoryRight={() => (
            <ThemedIcon name="arrow-ios-forward" size={25} />
          )}
        />
        <Divider />
        <ListItem
          title="View Welcome Swiper"
          onPress={() => navigation.navigate('Welcome', {goBack: true})}
          accessoryRight={() => (
            <ThemedIcon name="arrow-ios-forward" size={25} />
          )}
        />
        <Divider />
        <ListItem
          title="Credits"
          onPress={() => navigation.navigate('Credits')}
          accessoryRight={() => (
            <ThemedIcon name="arrow-ios-forward" size={25} />
          )}
        />
        <Divider />
        {profile.fb_login && (
          <>
            <ListItem
              title="Import Facebook Friends"
              onPress={() => {
                profile.username
                  ? setFbModalOpen(true)
                  : Alert.alert(
                      'Please set a username before trying to add a pal',
                    );
              }}
              accessoryRight={() => <ThemedIcon name="facebook" size={25} />}
            />
            <Divider />
          </>
        )}
        {profile.accountType === AccountType.ADMIN && (
          <>
            <ListItem
              title="Force crash"
              onPress={() => crashlytics().crash()}
              accessoryRight={() => (
                <ThemedIcon name="arrow-ios-forward" size={25} />
              )}
            />
            <Divider />
          </>
        )}
        <ListItem
          onPress={Instabug.show}
          title="Report a problem"
          accessoryRight={() => <ThemedIcon name="alert-triangle" size={25} />}
        />
        <Divider />
        <ListItem
          title={`Theme: ${theme}`}
          accessoryRight={() => (
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
          )}
        />
        <Divider />
        <ListItem
          title="Version"
          description={`${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}
        />
        <Divider />
        <ListItem
          title="Delete account"
          onPress={() => setShowDialog(true)}
          accessoryRight={() => (
            <ThemedIcon name="arrow-ios-forward" size={25} />
          )}
        />
        <Divider />
      </ScrollView>
      {spinner && (
        <View style={styles.spinner}>
          <ActivityIndicator />
        </View>
      )}
      <FbFriendsModal
        isOpen={fbModalOpen}
        onClosed={() => setFbModalOpen(false)}
      />
      <DialogInput
        isDialogVisible={showDialog}
        title="Enter email to confirm"
        message="All your data will be deleted."
        hintInput="Enter email"
        submitInput={async (inputText: string) => {
          if (inputText === profile.email) {
            setSpinner(true);
            try {
              await onRemoveUser();
              navigation.navigate('Login');
              Alert.alert('Success', 'Account deleted');
              setSpinner(false);
            } catch (e) {
              Alert.alert('Error', e.message);
              setSpinner(false);
            }
          } else {
            Alert.alert('Incorrect email');
          }
        }}
        closeDialog={() => setShowDialog(false)}
      />
    </Layout>
  );
};

const mapStateToProps = ({profile}: MyRootState) => ({
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  onRemoveUser: () => dispatch(removeUser()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
