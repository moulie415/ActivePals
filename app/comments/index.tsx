/**
 * Created by tino on 6/6/17.
 */
import React, { PureComponent } from "react";
import {
  View,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  TextInput,
  TouchableHighlight,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import Image from 'react-native-fast-image'
import IIcon from 'react-native-vector-icons/Ionicons'

import Text, { globalTextStyle } from '../components/Text'
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/FontAwesome"
import styles from "./styles";
import Collapsible from "react-native-collapsible"
import Comment from "./Comment";
import colors from '../constants/colors'
import { getMentionsList } from '../constants/utils'

const screen = Dimensions.get("screen");

export default class Comments extends PureComponent {
  constructor(props) {
    super(props);
    this.bookmark = null;
    this.props = props;
    this.state = {
      loadingComments: props.data && props.data.length ? false : true,
      likesModalVisible: false,
      likesModalData: null,
      editModalVisible: false,
      commentsLastUpdated: null,
      expanded: [],
      pagination: [],
      userFetchAmount: 10
   };
    this.newCommentText = null;
    this.replyCommentText = null;
    this.editCommentText = null;
    this.editingComment = null;
    this.textInputs = [];
    this.renderComment = this.renderComment.bind(this);

    this.handleReport = this.handleReport.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUsernameTap = this.handleUsernameTap.bind(this);
    this.handleLikesTap = this.handleLikesTap.bind(this);
    this.handleEditAction = this.handleEditAction.bind(this);
    this.renderLike = this.renderLike.bind(this);
  }

  setLikesModalVisible(visible) {
    this.setState({ likesModalVisible: visible });
  }

  setEditModalVisible(visible) {
    this.setState({ editModalVisible: visible });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      this.setState({
        commentsLastUpdated: new Date().getTime(),
        loadingComments: false
      })
    }
    if (nextProps.focusCommentInput) {
      this.inputMain.focus()
    }
  }

  isExpanded(id) {
    return this.state.expanded.indexOf(id) !== -1;
  }

  toggleExpand(c, focus) {
    const id = this.props.keyExtractor(c);
    let expanded = this.state.expanded;

    let index = expanded.indexOf(id);

    if (index === -1) {
      expanded.push(id);
    } else {
      expanded.splice(index, 1);
    }
    this.forceUpdate();
    this.setState({ expanded: expanded });
    if (focus && index === -1) {
      this.focusOnReplyInput(id);
    }
  }

  handleReport(c) {
    this.props.reportAction(c);
  }

  focusOnReplyInput(id) {
    console.log(id);
    let input = this.textInputs["input" + id];

    input.measure((x, y, width, height, pageX, pageY) => {
      console.log(pageY);
      input.focus();
      this.props.replyAction(pageY);
    });
  }

  handleReply(c) {
    if (!this.props.isChild) return;
    if (!this.props.isChild(c)) {
      this.toggleExpand(c, true);
    } else {
      this.focusOnReplyInput(this.props.parentIdExtractor(c));
    }
  }

  handleLike(c) {
    this.props.likeAction(c);
  }

  handleDelete(c) {
    this.props.deleteAction(c);
  }

  handleEdit(c) {
    this.editCommentText = this.props.bodyExtractor(c);
    this.editingComment = c;
    this.setEditModalVisible(!this.state.editModalVisible);
  }

  handleUsernameTap(username, uid) {
    if (this.props.usernameTapAction) {
      this.props.usernameTapAction(username, uid);
    }
  }

  handleLikesTap(c) {
    this.setLikesModalVisible(!this.state.likesModalVisible);
    this.props.likesTapAction(c).then(() => {
      this.setState({ likesModalData: this.props.likesExtractor(c), comment: c });
    })
  }

  handleEditAction(c) {
    this.props.editAction(this.editCommentText, c);
  }

  /**
   *
   * Generates a single comment
   * */
  generateComment(c) {
    return (
      <Comment
        data={c}
        id={this.props.keyExtractor(c)}
        usernameTapAction={this.handleUsernameTap}
        username={this.props.usernameExtractor(c)}
        viewingUserName={this.props.viewingUserName}
        uid={this.props.uidExtractor(c)}
        users={this.props.users}
        body={this.props.bodyExtractor(c)}
        likesNr={this.props.likeCountExtractor(c)}
        canEdit={this.canUserEdit(c)}
        updatedAt={this.props.editTimeExtractor(c)}
        replyAction={this.props.replyAction ? this.handleReply : null}
        image={this.props.imageExtractor(c)}
        child={true}
        reportAction={this.props.reportAction ? this.handleReport : null}
        liked={this.props.likeExtractor ? this.props.likeExtractor(c) : null}
        reported={
          this.props.reportedExtractor ? this.props.reportedExtractor(c) : null
        }
        likeAction={this.props.likeAction ? this.handleLike : null}
        editAction={this.handleEditAction}
        deleteAction={this.handleDelete}
        editComment={this.handleEdit}
        likesTapAction={this.props.likesTapAction ? this.handleLikesTap : null}
      />
    );
  }

  /**
   * Renders comments children
   * */
  renderChildren(items) {
    if (!items || !items.length) return;
    let self = this;
    return items.map(function(c) {
      return (
        <View key={self.props.keyExtractor(c) + "" + Math.random()}>
          {self.generateComment(c)}
        </View>
      );
    });
  }

  /**
   * Returns last child id
   * */
  getLastChildCommentId(item) {
    if (!item) return;
    const items = item[this.props.childPropName];
    return this.props.keyExtractor(items[items.length - 1]);
  }

  /**
   * Returns first child id
   * */
  getFirstChildCommentId(item) {
    if (!item) return;
    const items = item[this.props.childPropName];

    return this.props.keyExtractor(items[0]);
  }

  /**
   * Does a pagination action
   * */
  paginate(fromCommentId, direction, parentCommentId) {
    this.setState({ loadingComments: true });
    this.props.paginateAction(fromCommentId, direction, parentCommentId);
  }

  /**
   * Can user edit a comment
   * */
  canUserEdit(item) {
    if (this.props.viewingUserName == this.props.usernameExtractor(item)) {
      if (!this.props.editMinuteLimit) return true;
      let created =
        new Date(this.props.createdTimeExtractor(item)).getTime() / 1000;
      return (
        new Date().getTime() / 1000 - created < this.props.editMinuteLimit * 60
      );
    }
    return false;
  }

  renderLike(l) {
    let like = l.item;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setLikesModalVisible(false), this.handleUsernameTap(like.username, like.user_id);
        }}
        style={styles.likeButton}
        key={like.user_id + ""}
      >
        <View style={[styles.likeContainer]}>
          {like.image ? <Image style={[styles.likeImage]} source={{ uri: like.image }} /> : <IIcon name='md-contact'size={40} style={{ color: colors.primary, }} />}
          <Text style={[styles.likeName]}>{like.name || like.username}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a comment with pagination
   * */
  renderComment(c) {
    const item = c.item;
    return (
      <View>
        {this.generateComment(item)}
        <View style={{ marginLeft: 40 }}>
          {item.childrenCount && this.props.childPropName ? (
            <TouchableOpacity onPress={() => this.toggleExpand(item)}>
              <View style={styles.repliedSection}>
                <Image
                  style={styles.repliedImg}
                  source={{
                    uri: this.props.imageExtractor(
                      item[this.props.childPropName][0]
                    )
                  }}
                />
                <Text style={styles.repliedUsername}>
                  {" "}
                  {this.props.usernameExtractor(
                    item[this.props.childPropName][0]
                  )}{" "}
                </Text>
                <Text style={styles.repliedText}>replied</Text>
                <Text style={styles.repliedCount}>
                  {" "}
                  * {this.props.childrenCountExtractor(item)}
                  {this.props.childrenCountExtractor(item) > 1
                    ? " replies"
                    : " reply"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
          <Collapsible
            easing={"easeOutCubic"}
            duration={400}
            collapsed={!this.isExpanded(this.props.keyExtractor(item))}
          >
            {this.props.childrenCountExtractor(item) &&
            this.props.paginateAction ? (
              <View>
                {this.props.childPropName &&
                this.props.childrenCountExtractor(item) >
                  item[this.props.childPropName].length ? (
                  <TouchableOpacity
                    onPress={() =>
                      this.paginate(
                        this.getFirstChildCommentId(item),
                        "down",
                        this.props.keyExtractor(item)
                      )
                    }
                  >
                    <Text style={{ textAlign: "center", paddingTop: 15 }}>
                      Show previous...
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {this.renderChildren(
                  item[this.props.childPropName],
                  this.props.keyExtractor(item)
                )}

                {this.props.childrenCountExtractor(item) >
                  item[this.props.childPropName].length &&
                this.props.paginateAction ? (
                  <TouchableOpacity
                    onPress={() =>
                      this.paginate(
                        this.getLastChildCommentId(item),
                        "up",
                        this.props.keyExtractor(item)
                      )
                    }
                  >
                    <Text style={{ textAlign: "center", paddingTop: 15, color: colors.secondary }}>
                      Show more...
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            <View style={styles.inputSection}>
              <TextInput
                ref={input =>
                  (this.textInputs[
                    "input" + this.props.keyExtractor(item)
                  ] = input)
                }
                style={styles.input}
                multiline={true}
                onChangeText={text => (this.replyCommentText = text)}
                placeholder={"Write comment"}
                numberOfLines={3}
              />
              <TouchableOpacity
                onPress={() => {
                  this.props.saveAction(
                    this.replyCommentText,
                    this.props.keyExtractor(item)
                  );
                  this.replyCommentText = null;
                  this.textInputs[
                    "input" + this.props.keyExtractor(item)
                  ].clear();
                  Keyboard.dismiss();
                }}
              >
                <Icon
                  style={styles.submit}
                  name="chevron-right"
                  size={40}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
          </Collapsible>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            ref={input => this.inputMain = input}
            multiline={true}
            value={this.state.text}
            maxLength={280}
            onChangeText={text => {
		        this.newCommentText = text
            this.setState({text})
		        this.inputMain.setNativeProps({text})
            let list = getMentionsList(text, this.props.users)
            list ? this.setState({mentionList: list}) : this.setState({mentionList: null})   
	    }}
            placeholder={"Write comment..."}
            numberOfLines={3}
          />
          <TouchableOpacity
            onPress={() => {
              this.props.saveAction(this.newCommentText, false);
              this.newCommentText = null;
              this.setState({text: null})
              this.inputMain.clear()
              Keyboard.dismiss()
            }}
          >
            <Icon
              style={styles.submit}
              name="chevron-right"
              size={30}
              color="#000"
            />
          </TouchableOpacity>
        </View>
        {this.state.mentionList && 
            <View style={styles.mentionsList}>
            <FlatList 
              keyboardShouldPersistTaps={'handled'}
              data={this.state.mentionList}
              style={{backgroundColor: '#fff'}}
              keyExtractor={(item) => item.uid}
              renderItem={({item, index}) => {
                if (index < 10) {
                return <TouchableOpacity
                onPress={() => {
                  let split = this.state.text.split(" ")
                  split[split.length - 1] = "@" + item.username + " "
                  this.setState({text: split.join(" "), mentionList: null}, () => {
                    this.newCommentText = this.state.text
                  })
                }}
                style={{backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 5}}>
                  {item.avatar ? <Image source={{uri: item.avatar}} style={{height: 30, width: 30, borderRadius: 15}}/>
            : <IIcon name='md-contact' size={35} style={{color: colors.primary}}/>}
                  <Text style={{marginLeft: 10}}>{item.username}</Text>
                </TouchableOpacity>
                }
                return null
              }}
            /></View>}
        {!this.state.loadingComments && !this.props.data ? (
          <Text style={{ textAlign: "center" }}>No comments yet</Text>
        ) : null}

        {/*!this.state.loadingComments &&
        this.props.data &&
        this.props.paginateAction ? (
          <TouchableHighlight
            onPress={() => {
              this.paginate(
                this.props.keyExtractor(this.props.data[0]),
                "down"
              );
            }}
          >
            <View>
              <Text style={{ textAlign: "center" }}>Show previous</Text>
            </View>
          </TouchableHighlight>
        ) : null*/}
        {/*Comments*/}
        {this.props.data ? (
          <FlatList
            keyboardShouldPersistTaps="always"
            style={{ backgroundColor: "white" }}
            data={this.props.data}
            extraData={this.state.commentsLastUpdated}
            initialNumToRender={this.props.initialDisplayCount || 999}
            keyExtractor={item => this.props.keyExtractor(item) + ""}
            renderItem={this.renderComment}
          />
        ) : null}

        {this.state.loadingComments ? (
          <View
            style={{
              position: "absolute",
              zIndex: 10,
              bottom: 0,
              height: 60,
              backgroundColor: "rgba(255,255,255, 0.9)"
            }}
          >
            <ActivityIndicator
              animating={true}
              style={{
                height: 50,
                width: screen.width,
                alignItems: "center",
                justifyContent: "center"
              }}
              size="small"
            />
          </View>
        ) : null}

        {!this.state.loadingComments &&
        this.props.data &&
        this.props.paginateAction ? (
          <TouchableOpacity
            style={{ height: 70 }}
            onPress={() => {
              this.paginate(
                this.props.keyExtractor(
                  this.props.data[this.props.data.length - 1]
                ),
                "up"
              );
            }}
          >
            <Text style={{ textAlign: "center", color: colors.secondary }}>Show more</Text>
          </TouchableOpacity>
        ) : null}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.likesModalVisible}
          onRequestClose={() => {
            this.setLikesModalVisible(false);
            this.setState({userFetchAmount: 10})
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.setLikesModalVisible(false)
              }}
            style={{
              position: "absolute",
              width: 100,
              zIndex: 9,
              alignSelf: "flex-end",
              top: 10
            }}
          >
          <SafeAreaView>
            <View style={{ position: "relative", left: 50, top: 5 }}>
              <Icon name={"times"} size={40} />
            </View>
            </SafeAreaView>
          </TouchableOpacity>
          <SafeAreaView>
          <Text style={styles.likeHeader}>Users that repped the comment</Text>
          </SafeAreaView>

          {this.state.likesModalVisible ? (
            <FlatList
              initialNumToRender="10"
              ListFooterComponent={(item) => this.renderRepsFooter(item)}
              keyExtractor={item => item.user_id + ""}
              data={this.state.likesModalData}
              renderItem={this.renderLike}
            />
          ) : null}
        </Modal>

        <Modal
          animationType={"slide"}
          onShow={() => {
            this.textInputs["editCommentInput"].focus();
          }}
          transparent={true}
          visible={this.state.editModalVisible}
          onRequestClose={() => {
            this.setEditModalVisible(false);
            this.setState({ editModalData: null });
          }}
        >
          <View style={styles.editModalContainer}>
            <View style={styles.editModal}>
              <TextInput
                ref={input => (this.textInputs["editCommentInput"] = input)}
                style={styles.input}
                multiline={true}
                defaultValue={this.editCommentText}
                onChangeText={text => (this.editCommentText = text)}
                placeholder={"Edit comment"}
                numberOfLines={3}
              />
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                <TouchableOpacity
                  onPress={() => this.setEditModalVisible(false)}
                >
                  <View style={styles.editButtons}>
                    <Text>Cancel</Text>
                    <Icon name={"times"} size={20} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.props.editAction(
                      this.editCommentText,
                      this.editingComment
                    );
                    this.setEditModalVisible(!this.state.editModalVisible);
                  }}
                >
                  <View style={styles.editButtons}>
                    <Text>Save</Text>
                    <Icon name={"send"} size={20} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  renderRepsFooter() {
    if (this.state.likesModalData && this.state.comment &&
      this.state.comment.repCount > this.state.likesModalData.length) {
    return <TouchableOpacity 
      style={{alignItems: 'center'}}
      onPress={()=> {
        this.setState({userFetchAmount: this.state.userFetchAmount += 5}, () => {
          this.props.getCommentRepsUsers(this.state.comment, this.state.userFetchAmount)
            .then(users => {
              this.setState({likesModalData: users})
            })
        })
        
      }}>
        <Text style={{color: colors.secondary}}>Show more</Text>
        </TouchableOpacity>
  }
  return null
}
}

Comments.propTypes = {
  data: PropTypes.array.isRequired,
  viewingUserName: PropTypes.string,
  initialDisplayCount: PropTypes.number,
  editMinuteLimit: PropTypes.number,
  usernameTapAction: PropTypes.func,
  childPropName: PropTypes.string,
  isChild: PropTypes.func,
  keyExtractor: PropTypes.func.isRequired,
  parentIdExtractor: PropTypes.func,
  usernameExtractor: PropTypes.func.isRequired,
  uidExtractor: PropTypes.func.isRequired,
  editTimeExtractor: PropTypes.func.isRequired,
  createdTimeExtractor: PropTypes.func.isRequired,
  bodyExtractor: PropTypes.func.isRequired,
  imageExtractor: PropTypes.func.isRequired,
  likeExtractor: PropTypes.func,
  reportedExtractor: PropTypes.func,
  likesExtractor: PropTypes.func,
  likeCountExtractor: PropTypes.func,
  childrenCountExtractor: PropTypes.func,
  replyAction: PropTypes.func,
  saveAction: PropTypes.func.isRequired,
  deleteAction: PropTypes.func,
  editAction: PropTypes.func.isRequired,
  reportAction: PropTypes.func,
  likeAction: PropTypes.func,
  likesTapAction: PropTypes.func,
  paginateAction: PropTypes.func,
  getCommentRepsUsers: PropTypes.func,
};