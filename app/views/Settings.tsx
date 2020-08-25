import React, {FunctionComponent, useState, useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
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
import {Text, Layout, Toggle} from '@ui-kitten/components';
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
        <TouchableOpacity
          onPress={() => {
            Alert.alert('coming soon');
            // Linking.openURL('mailto:fitlink-support@gmail.com')
          }}
          style={styles.contact}>
          <Text>Contact Support</Text>
          <ThemedIcon name="arrow-ios-forward" size={25} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Welcome', {goBack: true})}
          style={styles.contact}>
          <Text>View Welcome Swiper</Text>
          <ThemedIcon name="arrow-ios-forward" size={25} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Credits')}
          style={styles.contact}>
          <Text>Credits</Text>
          <ThemedIcon name="arrow-ios-forward" size={25} />
        </TouchableOpacity>
        {profile.fb_login && (
          <TouchableOpacity
            onPress={() => {
              profile.username
                ? setFbModalOpen(true)
                : Alert.alert(
                    'Please set a username before trying to add a pal',
                  );
            }}
            style={styles.contact}>
            <Text>Import Facebook friends</Text>
            <ThemedIcon name="arrow-ios-forward" size={25} />
          </TouchableOpacity>
        )}
        {profile.accountType === AccountType.ADMIN && (
          <TouchableOpacity
            onPress={() => crashlytics().crash()}
            style={styles.contact}>
            <Text>Force crash</Text>
            <ThemedIcon name="arrow-ios-forward" size={25} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={Instabug.show} style={styles.contact}>
          <Text>Report a problem</Text>
          <ThemedIcon name="alert-triangle" size={25} />
        </TouchableOpacity>
        <View style={styles.contact}>
          <Text>{`Theme: ${theme}`}</Text>
          <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
        </View>
        <View style={styles.contact}>
          <Text>Version no: </Text>
          <Text
            style={{
              fontWeight: 'bold',
            }}>{`${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}</Text>
        </View>
        <TouchableOpacity
          style={{padding: 15}}
          onPress={() => setShowDialog(true)}>
          <Text style={{color: 'red'}}>Delete account</Text>
        </TouchableOpacity>
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
