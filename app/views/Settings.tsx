import React, { Component } from 'react';
import { View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import VersionNumber from 'react-native-version-number';
import DialogInput from 'react-native-dialog-input';
import { PulseIndicator } from 'react-native-indicators';
import Instabug from 'instabug-reactnative';
import { connect } from 'react-redux';
import colors from '../constants/colors';
import styles from '../styles/settingsStyles';
import Text from '../components/Text';
import Header from '../components/Header/header';
import FbFriendsModal from '../components/FbFriendsModal';
import { removeUser } from '../actions/profile';
import SettingsProps from '../types/views/Settings';

interface State {
  spinner: boolean;
  showDialog: boolean;
  fbModalOpen?: boolean;
}
class Settings extends Component<SettingsProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      spinner: false,
      showDialog: false,
    };
  }

  static navigationOptions = {
    headerShown: false,
  };

  render() {
    const { profile, onRemoveUser, navigation } = this.props;
    const { spinner, fbModalOpen, showDialog } = this.state;
    return (
      <View style={styles.container}>
        <Header hasBack title="Settings" />
        <ScrollView>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('coming soon');
              // Linking.openURL('mailto:fitlink-support@gmail.com')
            }}
            style={styles.contact}
          >
            <Text>Contact Support</Text>
            <Icon name="ios-arrow-forward" size={25} style={{ color: colors.primary }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Welcome', { goBack: true })} style={styles.contact}>
            <Text>View Welcome Swiper</Text>
            <Icon name="ios-arrow-forward" size={25} style={{ color: colors.primary }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Credits')} style={styles.contact}>
            <Text>Credits</Text>
            <Icon name="ios-arrow-forward" size={25} style={{ color: colors.primary }} />
          </TouchableOpacity>
          {profile.fb_login && (
            <TouchableOpacity
              onPress={() => {
                profile.username
                  ? this.setState({ fbModalOpen: true })
                  : Alert.alert('Please set a username before trying to add a pal');
              }}
              style={styles.contact}
            >
              <Text>Import Facebook friends</Text>
              <Icon name="ios-arrow-forward" size={25} style={{ color: colors.primary }} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={Instabug.show} style={styles.contact}>
            <Text>Report a problem</Text>
            <Icon name="ios-bug" size={25} style={{ color: colors.primary }} />
          </TouchableOpacity>
          <View style={styles.contact}>
            <Text>Version no: </Text>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{VersionNumber.appVersion}</Text>
          </View>
          <TouchableOpacity
            style={{ padding: 15, backgroundColor: '#fff' }}
            onPress={() => this.setState({ showDialog: true })}
          >
            <Text style={{ color: 'red' }}>Delete account</Text>
          </TouchableOpacity>
        </ScrollView>
        {spinner && (
          <View style={styles.spinner}>
            <PulseIndicator color={colors.secondary} />
          </View>
        )}
        <FbFriendsModal isOpen={fbModalOpen} onClosed={() => this.setState({ fbModalOpen: false })} />
        <DialogInput
          isDialogVisible={showDialog}
          title="Enter email to confirm"
          message="All your data will be deleted."
          hintInput="Enter email"
          submitInput={async inputText => {
            if (inputText === profile.email) {
              this.setState({ spinner: true });
              try {
                await onRemoveUser();
                navigation.navigate('Login');
                Alert.alert('Success', 'Account deleted');
                this.setState({ spinner: false });
              } catch (e) {
                Alert.alert('Error', e.message);
                this.setState({ spinner: false });
              }
            } else {
              Alert.alert('Incorrect email');
            }
          }}
          closeDialog={() => this.setState({ showDialog: false })}
        />
      </View>
    );
  }
}

const mapStateToProps = ({ profile }) => ({
  profile: profile.profile,
});

const mapDispatchToProps = dispatch => ({
  onRemoveUser: () => dispatch(removeUser()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
