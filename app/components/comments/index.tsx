/**
 * Created by tino on 6/6/17.
 */
import React, { PureComponent } from 'react';
import {
  View,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Image from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import Collapsible from 'react-native-collapsible';
import IIcon from 'react-native-vector-icons/Ionicons';
import Text, { globalTextStyle } from '../Text';
import styles from './styles';
import Comment from './Comment';
import colors from '../../constants/colors';
import { getMentionsList } from '../../constants/utils';
import CommentsProps from '../../types/components/Comments';
import Profile from '../../types/Profile';

const screen = Dimensions.get('screen');

interface State {
  loadingComments: boolean;
  editModalVisible: boolean;
  commentsLastUpdated: any;
  expanded: any;
  mentionList?: Profile[];
}

export default class Comments extends PureComponent<CommentsProps, State> {
  inputMain: TextInput;

  constructor(props) {
    super(props);
    this.bookmark = null;
    this.props = props;
    this.state = {
      loadingComments: props.data && props.data.length ? false : true,
      editModalVisible: false,
      commentsLastUpdated: null,
      expanded: [],
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

  setEditModalVisible(visible) {
    this.setState({ editModalVisible: visible });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      this.setState({
        commentsLastUpdated: new Date().getTime(),
        loadingComments: false,
      });
    }
    if (nextProps.focusCommentInput) {
      this.inputMain.focus();
    }
  }

  isExpanded(id) {
    return this.state.expanded.indexOf(id) !== -1;
  }

  toggleExpand(c, focus) {
    const id = this.props.keyExtractor(c);
    const expanded = this.state.expanded;

    const index = expanded.indexOf(id);

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
    const input = this.textInputs['input' + id];

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
      this.focusOnReplyInput(this.props.keyExtractor(c));
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
    this.props.likesTapAction(c);
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
        child
        reportAction={this.props.reportAction ? this.handleReport : null}
        liked={this.props.likeExtractor ? this.props.likeExtractor(c) : null}
        reported={this.props.reportedExtractor ? this.props.reportedExtractor(c) : null}
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
      return <View key={self.props.keyExtractor(c) + '' + Math.random()}>{self.generateComment(c)}</View>;
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
  paginate(comments, direction) {
    this.setState({ loadingComments: true });
    const sortedComments = comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const fromComment = sortedComments[0];
    if (fromComment.parentCommentId) {
      const parentComment = this.props.data.find(comment => comment.key === fromComment.parentCommentId);
      this.props.paginateAction(fromComment, direction, parentComment);
      return;
    }
    this.props.paginateAction(fromComment, direction);
  }

  /**
   * Can user edit a comment
   * */
  canUserEdit(item) {
    if (this.props.viewingUserName == this.props.usernameExtractor(item)) {
      if (!this.props.editMinuteLimit) return true;
      const created = new Date(this.props.createdTimeExtractor(item)).getTime() / 1000;
      return new Date().getTime() / 1000 - created < this.props.editMinuteLimit * 60;
    }
    return false;
  }

  renderLike(l) {
    const like = l.item;
    return (
      <TouchableOpacity
        onPress={() => {
          this.handleUsernameTap(like.username, like.user_id);
        }}
        style={styles.likeButton}
        key={like.user_id}
      >
        <View style={[styles.likeContainer]}>
          {like.image ? (
            <Image style={[styles.likeImage]} source={{ uri: like.image }} />
          ) : (
            <IIcon name="md-contact" size={40} style={{ color: colors.primary }} />
          )}
          <Text>{like.name || like.username}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a comment with pagination
   * */
  renderComment(c) {
    const item = c.item;
    const childPropName = this.props.childPropName;
    return (
      <View>
        {this.generateComment(item)}
        <View style={{ marginLeft: 40 }}>
          {item.childrenCount && item[childPropName] && item[childPropName][0] ? (
            <TouchableOpacity onPress={() => this.toggleExpand(item)}>
              <View style={styles.repliedSection}>
                <Image
                  style={styles.repliedImg}
                  source={{
                    uri: this.props.imageExtractor(item[childPropName][0]),
                  }}
                />
                <Text style={styles.repliedUsername}> {this.props.usernameExtractor(item[childPropName][0])} </Text>
                <Text style={styles.repliedText}>replied</Text>
                <Text style={styles.repliedCount}>
                  {' '}
                  * {this.props.childrenCountExtractor(item)}
                  {this.props.childrenCountExtractor(item) > 1 ? ' replies' : ' reply'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
          <Collapsible
            easing={'easeOutCubic'}
            duration={400}
            collapsed={!this.isExpanded(this.props.keyExtractor(item))}
          >
            {this.props.childrenCountExtractor(item) && this.props.paginateAction ? (
              <View>
                {/* {this.props.childPropName &&
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
                ) : null} */}

                {this.renderChildren(item[this.props.childPropName], this.props.keyExtractor(item))}

                {item[this.props.childPropName] &&
                this.props.childrenCountExtractor(item) > item[this.props.childPropName].length &&
                this.props.paginateAction ? (
                  <TouchableOpacity onPress={() => this.paginate(item[this.props.childPropName], 'up')}>
                    <Text style={{ textAlign: 'center', paddingTop: 15, color: colors.secondary }}>Show more...</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            <View style={styles.inputSection}>
              <TextInput
                ref={input => (this.textInputs['input' + this.props.keyExtractor(item)] = input)}
                style={styles.input}
                multiline
                onChangeText={text => (this.replyCommentText = text)}
                placeholder={'Write comment'}
                numberOfLines={3}
              />
              <TouchableOpacity
                onPress={() => {
                  this.props.saveAction(this.replyCommentText, this.props.parentIdExtractor(item));
                  this.replyCommentText = null;
                  this.textInputs['input' + this.props.keyExtractor(item)].clear();
                  Keyboard.dismiss();
                }}
              >
                <IIcon style={styles.submit} name="md-return-right" size={40} color="#000" />
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
            ref={input => {
              this.inputMain = input;
            }}
            multiline
            value={this.state.text}
            maxLength={280}
            onChangeText={text => {
              this.newCommentText = text;
              this.setState({ text });
              this.inputMain.setNativeProps({ text });
              const list = getMentionsList(text, this.props.users);
              list ? this.setState({ mentionList: list }) : this.setState({ mentionList: null });
            }}
            placeholder="Write comment..."
            numberOfLines={3}
          />
          <TouchableOpacity
            onPress={() => {
              this.props.saveAction(this.newCommentText, null);
              this.newCommentText = null;
              this.setState({ text: null });
              this.inputMain.clear();
              Keyboard.dismiss();
            }}
          >
            <IIcon style={styles.submit} name="md-return-right" size={30} color="#000" />
          </TouchableOpacity>
        </View>
        {this.state.mentionList && (
          <View style={styles.mentionsList}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={this.state.mentionList}
              style={{ backgroundColor: '#fff' }}
              keyExtractor={item => item.uid}
              renderItem={({ item, index }) => {
                if (index < 10) {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        let split = this.state.text.split(' ');
                        split[split.length - 1] = '@' + item.username + ' ';
                        this.setState({ text: split.join(' '), mentionList: null }, () => {
                          this.newCommentText = this.state.text;
                        });
                      }}
                      style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 5 }}
                    >
                      {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={{ height: 30, width: 30, borderRadius: 15 }} />
                      ) : (
                        <IIcon name="md-contact" size={35} style={{ color: colors.primary }} />
                      )}
                      <Text style={{ marginLeft: 10 }}>{item.username}</Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              }}
            />
          </View>
        )}
        {!this.state.loadingComments && !this.props.data ? (
          <Text style={{ textAlign: 'center' }}>No comments yet</Text>
        ) : null}

        {/* !this.state.loadingComments &&
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
        ) : null */}
        {/* Comments */}
        {this.props.data ? (
          <FlatList
            keyboardShouldPersistTaps="always"
            style={{ backgroundColor: 'white' }}
            data={this.props.data}
            extraData={this.state.commentsLastUpdated}
            initialNumToRender={this.props.initialDisplayCount || 999}
            keyExtractor={item => this.props.keyExtractor(item) + ''}
            renderItem={this.renderComment}
          />
        ) : null}

        {this.state.loadingComments ? (
          <View
            style={{
              position: 'absolute',
              zIndex: 10,
              bottom: 0,
              height: 60,
              backgroundColor: 'rgba(255,255,255, 0.9)',
            }}
          >
            <ActivityIndicator
              animating
              style={{
                height: 50,
                width: screen.width,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              size="small"
            />
          </View>
        ) : null}

        {!this.state.loadingComments &&
        this.props.data &&
        this.props.data.length < this.props.commentCount &&
        this.props.paginateAction ? (
          <TouchableOpacity
            style={{ height: 70 }}
            onPress={() => {
              this.paginate(this.props.data, 'up');
            }}
          >
            <Text style={{ textAlign: 'center', color: colors.secondary }}>Show more</Text>
          </TouchableOpacity>
        ) : null}
      

        <Modal
          animationType={'slide'}
          onShow={() => {
            this.textInputs['editCommentInput'].focus();
          }}
          transparent
          visible={this.state.editModalVisible}
          onRequestClose={() => {
            this.setEditModalVisible(false);
            this.setState({ editModalData: null });
          }}
        >
          <View style={styles.editModalContainer}>
            <View style={styles.editModal}>
              <TextInput
                ref={input => (this.textInputs['editCommentInput'] = input)}
                style={styles.input}
                multiline
                defaultValue={this.editCommentText}
                onChangeText={text => (this.editCommentText = text)}
                placeholder={'Edit comment'}
                numberOfLines={3}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity onPress={() => this.setEditModalVisible(false)}>
                  <View style={styles.editButtons}>
                    <Text>Cancel</Text>
                    <Icon name={'times'} size={20} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.props.editAction(this.editCommentText, this.editingComment);
                    this.setEditModalVisible(!this.state.editModalVisible);
                  }}
                >
                  <View style={styles.editButtons}>
                    <Text>Save</Text>
                    <Icon name={'send'} size={20} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}
