/**
 * Created by tino on 6/6/17.
 */
import React, { PureComponent } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableHighlight,
  Modal,
  Alert
} from "react-native";

import Image from 'react-native-fast-image'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import PropTypes from "prop-types";
import TimeAgo from "react-native-timeago";
import Icon from "react-native-vector-icons/FontAwesome";
import styles from "./styles";
import colors from '../constants/colors'
import Collapsible from "react-native-collapsible";
import {Image as SlowImage } from 'react-native'
import TouchableOpacity from '../constants/TouchableOpacityLockable'

const weightUp = require('Anyone/assets/images/weightlifting_up.png')
const weightDown = require('Anyone/assets/images/weightlifting_down.png')

export default class Comment extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      menuVisible: false
    };

    this.handleReport = this.handleReport.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUsernameTap = this.handleUsernameTap.bind(this);
    this.handleLikesTap = this.handleLikesTap.bind(this);
  }

  handleReport() {
    Alert.alert(
      "Confirm report",
      "Are you sure you want to report?",
      [
        {
          text: "Yes",
          onPress: () => this.props.reportAction(this.props.data)
        },
        { text: "No", onPress: () => null }
      ],
      true
    );
  }
  handleReply() {
    this.props.replyAction(this.props.data);
  }
  handleLike() {
    this.props.likeAction(this.props.data);
  }
  handleEdit() {
    this.props.editComment(this.props.data);
  }

  handleDelete() {
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete?",
      [
        {
          text: "Yes",
          onPress: () => this.props.deleteAction(this.props.data)
        },
        { text: "No", onPress: () => null }
      ],
      true
    );
  }
  handleUsernameTap() {
    if (this.props.usernameTapAction) {
      this.props.usernameTapAction(this.props.username, this.props.uid);
    }
  }
  handleLikesTap() {
    this.props.likesTapAction(this.props.data);
  }

  setModalVisible() {
    this.setState({ menuVisible: !this.state.menuVisible });
  }

  render() {
    return (
      <View style={styles.commentContainer}>
        <View style={styles.left}>
          <TouchableOpacity onPress={this.handleUsernameTap}>
            <View style={{ alignItems: "center" }}>
              <Image
                style={[
                  styles.image,
                  { width: 30, height: 30, borderRadius: 15 }
                ]}
                source={
                  typeof this.props.image === "string"
                    ? { uri: this.props.image }
                    : this.props.image
                }
              />
              {this.props.likesNr && this.props.likeAction ? (
                <TouchableOpacity
                  style={[styles.actionButton, { paddingTop: 5 }]}
                  onPress={this.handleLikesTap}
                >
                  <View style={{ flexDirection: "row" }}>
                    <SlowImage source={weightUp}  style={{width: 15, height: 15, tintColor: colors.secondary}}/>
                    <Text style={styles.likeNr}> {this.props.likesNr}</Text>
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => this.setState({ menuVisible: false })}
          onLongPress={() => this.setModalVisible()}
          style={styles.right}
        >
          <View style={styles.rightContent}>
            <View style={styles.rightContentTop}>
              <TouchableOpacity onPress={this.handleUsernameTap}>
                <Text style={styles.name}>{this.props.username}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.body}>{this.props.body}</Text>
          </View>
          <View style={styles.rightActionBar}>
            <TimeAgo style={styles.time} time={this.props.updatedAt} />
            {this.props.likeAction ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(mutex)=> {
                  mutex.lockFor(3000)
                  this.handleLike()
                  }}
              >
                <View style={{ flexDirection: "row" , marginTop: 2}}>
                  <Text
                    style={[
                      styles.actionText,
                      { color: this.props.liked ? "#4DB2DF" : '#999' }
                    ]}
                  >
                    Rep{" "}
                  </Text>
                    <SlowImage source={this.props.liked ? weightUp : weightDown}  
                    style={{width: 15, height: 15, tintColor: this.props.liked? colors.secondary : '#999'}}/>
                </View>
              </TouchableOpacity>
            ) : null}
            {this.props.replyAction ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={this.handleReply}
              >
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
        {this.state.menuVisible ? (
          <View style={styles.menu}>
            {this.props.canEdit ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={this.handleEdit}
              >
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
            ) : null}
            {this.props.reportAction ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={this.handleReport}
              >
                {this.props.reported ? (
                  <Text
                    style={[
                      styles.menuText,
                      { fontStyle: "italic", fontSize: 11}
                    ]}
                  >
                    Reported
                  </Text>
                ) : (
                  <Text style={styles.menuText}>Report</Text>
                )}
              </TouchableOpacity>
            ) : null}
            {this.props.canEdit ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={this.handleDelete}
              >
                <Text style={styles.menuText}>Delete</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }
}

Comment.propTypes = {
  data: PropTypes.object,
  body: PropTypes.string,
  canEdit: PropTypes.bool,
  child: PropTypes.bool,
  editComment: PropTypes.func,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  likeAction: PropTypes.func,
  liked: PropTypes.bool,
  likesNr: PropTypes.number,
  likesTapAction: PropTypes.func,
  replyAction: PropTypes.func,
  deleteAction: PropTypes.func,
  reportAction: PropTypes.func,
  reported: PropTypes.bool,
  updatedAt: PropTypes.string,
  username: PropTypes.string,
  usernameTapAction: PropTypes.func
};
