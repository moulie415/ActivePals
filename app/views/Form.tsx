import React, {Component, createRef} from 'react';
import {View, TextInput, Platform, KeyboardAvoidingView} from 'react-native';
import {connect} from 'react-redux';

import styles from '../styles/formStyles';
import FormProps from '../types/views/Form';
import {Text, List, Divider} from '@ui-kitten/components';

interface State {
  required: string;
  [key: string]: string;
}
class Form extends Component<FormProps, State> {
  list;

  textInputs: TextInput[];

  constructor(props) {
    super(props);
    this.list = createRef();
    this.state = {
      required: 'none',
    };
    this.textInputs = [];
  }

  render() {
    const {navigation} = this.props;
    const {params} = navigation.state;
    const {verification} = params;
    const {required} = this.state;
    return (
      <KeyboardAvoidingView
        style={styles.rootView}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={50}>
        <View style={{flex: 1}}>
          <List
            ItemSeparatorComponent={Divider}
            ref={this.list}
            style={styles.list}
            data={[
              {
                key: 'name',
                title: 'Name',
                placeholder: 'Your name',
              },
              {
                key: 'gym',
                title: 'Gym',
                placeholder: 'Your gym',
              },
              {
                key: 'rep',
                title: 'REPs Code',
                placeholder: 'Your REPs code if you have one',
              },
              {
                key: 'subject',
                title: 'Subject',
                placeholder: '',
              },
              {
                key: 'details',
                title: 'Details',
                placeholder: 'Include any details you think may be relevant',
                large: true,
              },
            ]}
            renderItem={({item, index}) => {
              const {key} = item;
              const {key: value} = this.state;
              const isRequired = required === key;
              return (
                <View style={styles.listCell}>
                  <Text style={styles.listCellText}>{item.title}</Text>
                  {key === 'subject' ? (
                    <Text style={{marginLeft: 5}}>
                      Personal trainer verification
                    </Text>
                  ) : (
                    <TextInput
                      ref={(i) => {
                        this.textInputs[index] = i;
                      }}
                      onChangeText={(text) => this.setState({[key]: text})}
                      value={value}
                      autoCapitalize="none"
                      onFocus={() => this.list.current.scrollToIndex({index})}
                      onSubmitEditing={() => {
                        if (index + 1 < this.textInputs.length) {
                          this.textInputs[index + 1].focus();
                        }
                      }}
                      style={[
                        styles.listCellInput,
                        item.large && styles.listCellInputLarge,
                        isRequired && styles.listCellInputRequired,
                      ]}
                      multiline={item.large}
                      underlineColorAndroid="transparent"
                      placeholder={item.placeholder}
                    />
                  )}
                </View>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = ({profile}) => ({
  profile: profile.profile,
  gym: profile.gym,
});

export default connect(mapStateToProps, null)(Form);
