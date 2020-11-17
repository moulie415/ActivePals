/**
 * Created by tino on 6/6/17.
 */
import React, {PureComponent} from 'react';
import {Alert, TouchableOpacity, Image as SlowImage} from 'react-native';
import Image from 'react-native-fast-image';
import database from '@react-native-firebase/database';
import TimeAgo from 'react-native-timeago';
import styles from './styles';
import str from '../../constants/strings';
import CommentProps from '../../types/components/CommentProps';
import {Layout, Text} from '@ui-kitten/components';
import RepIcon from '../RepIcon/RepIcon';

interface State {
  menuVisible: boolean;
}

export default class Comment extends PureComponent<CommentProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      menuVisible: false,
    };

    this.handleReport = this.handleReport.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUsernameTap = this.handleUsernameTap.bind(this);
    this.handleLikesTap = this.handleLikesTap.bind(this);
  }

  setModalVisible() {
    const {menuVisible: mVisible} = this.state;
    this.setState({menuVisible: !mVisible});
  }

  handleLikesTap() {
    const {likesTapAction, data} = this.props;
    likesTapAction(data);
  }

  handleUsernameTap() {
    const {usernameTapAction, uid, username} = this.props;
    if (usernameTapAction) {
      usernameTapAction(username, uid);
    }
  }

  handleReport() {
    const {data, reportAction} = this.props;
    Alert.alert('Confirm report', 'Are you sure you want to report?', [
      {
        text: 'Yes',
        onPress: () => reportAction(data),
      },
      {text: 'No', onPress: () => null},
    ]);
  }

  handleReply() {
    const {data, replyAction} = this.props;
    replyAction && replyAction(data);
  }

  handleLike() {
    const {data, likeAction} = this.props;
    likeAction(data);
  }

  handleEdit() {
    const {data, editComment} = this.props;
    editComment(data);
  }

  handleDelete() {
    const {data, deleteAction} = this.props;
    Alert.alert('Confirm delete', 'Are you sure you want to delete?', [
      {
        text: 'Yes',
        onPress: () => deleteAction(data),
      },
      {text: 'No', onPress: () => null},
    ]);
  }

  handleUsernamePress(n) {
    const name = n.substring(1);
    const {users, viewingUserName, usernameTapAction} = this.props;
    if (name === viewingUserName) {
      // this.props.goToProfile()
    } else {
      if (users) {
        const found = users.find((user) => user.username === name);
        if (found) {
          usernameTapAction(name, found.uid);
        } else {
          this.fetchUser(name);
        }
      } else {
        this.fetchUser(name);
      }
    }
  }

  async fetchUser(name) {
    const {usernameTapAction} = this.props;
    const snapshot = await database()
      .ref('usernames')
      .child(name)
      .once('value');
    if (snapshot.val()) {
      usernameTapAction(name, snapshot.val());
    }
  }

  render() {
    const {menuVisible} = this.state;
    const {
      image,
      likesNr,
      username,
      body,
      likeAction,
      updatedAt,
      liked,
      replyAction,
      canEdit,
      reportAction,
      reported,
    } = this.props;
    return (
      <Layout style={styles.commentContainer}>
        <Layout style={styles.left}>
          <TouchableOpacity onPress={this.handleUsernameTap}>
            <Layout style={{alignItems: 'center'}}>
              <Image
                style={[
                  styles.image,
                  {width: 30, height: 30, borderRadius: 15},
                ]}
                source={typeof image === 'string' ? {uri: image} : image}
              />
              {likesNr && likeAction ? (
                <TouchableOpacity
                  style={{paddingTop: 5}}
                  onPress={this.handleLikesTap}>
                  <Layout style={{flexDirection: 'row'}}>
                    <RepIcon disabled active size={15} />
                    <Text style={styles.likeNr}> {likesNr}</Text>
                  </Layout>
                </TouchableOpacity>
              ) : null}
            </Layout>
          </TouchableOpacity>
        </Layout>
        <TouchableOpacity
          onPress={() => this.setState({menuVisible: false})}
          onLongPress={() => this.setModalVisible()}
          style={styles.right}>
          <Layout style={styles.rightContent}>
            <Layout style={styles.rightContentTop}>
              <TouchableOpacity onPress={this.handleUsernameTap}>
                <Text style={styles.name}>{username}</Text>
              </TouchableOpacity>
            </Layout>
            <Text
              // parse={[
              //   {
              //     pattern: str.mentionRegex,
              //     onPress: this.handleUsernamePress.bind(this),
              //   },
              // ]}
              style={styles.body}>
              {body}
            </Text>
          </Layout>
          <Layout style={styles.rightActionBar}>
            <TimeAgo style={styles.time} time={updatedAt} />
            {likeAction ? (
              <RepIcon
                onPress={() => this.handleLike()}
                size={25}
                active={liked}
              />
            ) : null}
            {replyAction ? (
              <TouchableOpacity onPress={this.handleReply}>
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            ) : null}
          </Layout>
        </TouchableOpacity>
        {menuVisible ? (
          <Layout style={styles.menu}>
            {canEdit ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={this.handleEdit}>
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
            ) : null}
            {reportAction ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={this.handleReport}>
                {reported ? (
                  <Text
                    style={[
                      styles.menuText,
                      {fontStyle: 'italic', fontSize: 11},
                    ]}>
                    Reported
                  </Text>
                ) : (
                  <Text style={styles.menuText}>Report</Text>
                )}
              </TouchableOpacity>
            ) : null}
            {canEdit ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={this.handleDelete}>
                <Text style={styles.menuText}>Delete</Text>
              </TouchableOpacity>
            ) : null}
          </Layout>
        ) : null}
      </Layout>
    );
  }
}
