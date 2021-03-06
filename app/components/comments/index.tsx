/**
 * Created by tino on 6/6/17.
 */
import React, {PureComponent} from 'react';
import {Modal, Dimensions, Keyboard, TouchableOpacity} from 'react-native';
import Image from 'react-native-fast-image';
import Collapsible from 'react-native-collapsible';
import styles from './styles';
import {getMentionsList} from '../../constants/utils';
import CommentsProps from '../../types/components/Comments';
import Profile from '../../types/Profile';
import CommentType from '../../types/Comment';
import Comment from './Comment';
import {
  Icon,
  Text,
  List,
  Divider,
  Spinner,
  Input,
  Layout,
} from '@ui-kitten/components';
import ThemedIcon from '../ThemedIcon/ThemedIcon';

const screen = Dimensions.get('screen');

interface State {
  loadingComments: boolean;
  editModalVisible: boolean;
  commentsLastUpdated: any;
  expanded: any;
  mentionList?: Profile[];
  text?: string;
}

export default class Comments extends PureComponent<CommentsProps, State> {
  inputMain: Input;

  textInputs: Input[];

  newCommentText: string;

  replyCommentText: string;

  editCommentText: string;

  editingComment: CommentType;

  constructor(props) {
    super(props);
    this.state = {
      // loadingComments: !(props.data && props.data.length),
      loadingComments: !(props.data && props.data.length),
      editModalVisible: false,
      commentsLastUpdated: null,
      expanded: [],
    };

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

  setEditModalVisible(visible) {
    this.setState({editModalVisible: visible});
  }

  /**
   * Returns first child id
   * */
  getFirstChildCommentId(item) {
    const {childPropName, keyExtractor} = this.props;
    if (!item) {
      return;
    }
    const items = item[childPropName];

    return keyExtractor(items[0]);
  }

  /**
   * Returns last child id
   * */
  getLastChildCommentId(item) {
    const {childPropName, keyExtractor} = this.props;
    if (!item) {
      return;
    }
    const items = item[childPropName];
    return keyExtractor(items[items.length - 1]);
  }

  isExpanded(id) {
    const {expanded} = this.state;
    return expanded.indexOf(id) !== -1;
  }

  toggleExpand(c, focus?: boolean) {
    const {expanded} = this.state;
    const {keyExtractor} = this.props;
    const id = keyExtractor(c);

    const index = expanded.indexOf(id);

    if (index === -1) {
      expanded.push(id);
    } else {
      expanded.splice(index, 1);
    }
    this.forceUpdate();
    this.setState({expanded});
    if (focus && index === -1) {
      this.focusOnReplyInput(id);
    }
  }

  handleReport(c) {
    const {reportAction} = this.props;
    reportAction(c);
  }

  focusOnReplyInput(id) {
    console.log(id);
    const input = this.textInputs[`input${id}`];

    input.measure((x, y, width, height, pageX, pageY) => {
      const {replyAction} = this.props;
      console.log(pageY);
      input.focus();
      replyAction && replyAction(pageY);
    });
  }

  handleReply(c) {
    const {isChild, keyExtractor} = this.props;
    if (!isChild) {
      return;
    }
    if (!isChild(c)) {
      this.toggleExpand(c, true);
    } else {
      this.focusOnReplyInput(keyExtractor(c));
    }
  }

  handleLike(c) {
    const {likeAction} = this.props;
    likeAction(c);
  }

  handleDelete(c) {
    const {deleteAction} = this.props;
    deleteAction(c);
  }

  handleEdit(c) {
    const {bodyExtractor} = this.props;
    const {editModalVisible} = this.state;
    this.editCommentText = bodyExtractor(c);
    this.editingComment = c;
    this.setEditModalVisible(!editModalVisible);
  }

  handleUsernameTap(username, uid) {
    const {usernameTapAction} = this.props;
    if (usernameTapAction) {
      usernameTapAction(username, uid);
    }
  }

  handleLikesTap(c) {
    const {likesTapAction} = this.props;
    likesTapAction(c);
  }

  handleEditAction(c) {
    const {editAction} = this.props;
    editAction(this.editCommentText, c);
  }

  /**
   *
   * Generates a single comment
   * */
  generateComment(c) {
    const {
      keyExtractor,
      usernameExtractor,
      uidExtractor,
      users,
      bodyExtractor,
      likeCountExtractor,
      editTimeExtractor,
      replyAction,
      imageExtractor,
      viewingUserName,
      reportAction,
      likeExtractor,
      reportedExtractor,
      likeAction,
      likesTapAction,
      isChild,
    } = this.props;
    return (
      <Comment
        data={c}
        id={keyExtractor(c)}
        usernameTapAction={this.handleUsernameTap}
        username={usernameExtractor(c)}
        viewingUserName={viewingUserName}
        uid={uidExtractor(c)}
        users={users}
        body={bodyExtractor(c)}
        likesNr={likeCountExtractor(c)}
        canEdit={this.canUserEdit(c)}
        updatedAt={editTimeExtractor(c)}
        replyAction={replyAction ? this.handleReply : null}
        image={imageExtractor(c)}
        child={isChild(c)}
        reportAction={reportAction ? this.handleReport : null}
        liked={likeExtractor ? likeExtractor(c) : null}
        reported={reportedExtractor ? reportedExtractor(c) : null}
        likeAction={likeAction ? this.handleLike : null}
        editAction={this.handleEditAction}
        deleteAction={this.handleDelete}
        editComment={this.handleEdit}
        likesTapAction={likesTapAction ? this.handleLikesTap : null}
      />
    );
  }

  /**
   * Can user edit a comment
   * */
  canUserEdit(item) {
    const {
      viewingUserName,
      usernameExtractor,
      editMinuteLimit,
      createdTimeExtractor,
    } = this.props;
    if (viewingUserName === usernameExtractor(item)) {
      if (!editMinuteLimit) {
        return true;
      }
      const created = new Date(createdTimeExtractor(item)).getTime() / 1000;
      return new Date().getTime() / 1000 - created < editMinuteLimit * 60;
    }
    return false;
  }

  /**
   * Does a pagination action
   * */
  paginate(comments, direction) {
    const {data, paginateAction} = this.props;
    this.setState({loadingComments: true});
    const sortedComments = comments.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const fromComment = sortedComments[0];
    if (fromComment.parentCommentId) {
      const parentComment = data.find(
        (comment) => comment.key === fromComment.parentCommentId,
      );
      paginateAction(fromComment, direction, parentComment);
      return;
    }
    paginateAction(fromComment, direction);
  }

  /**
   * Renders comments children
   * */
  renderChildren(items) {
    const {keyExtractor} = this.props;
    if (!items || !items.length) {
      return;
    }
    return items.map((c) => {
      return (
        <Layout key={keyExtractor(c) + Math.random()}>
          {this.generateComment(c)}
        </Layout>
      );
    });
  }

  renderLike(l) {
    const like = l.item;
    return (
      <TouchableOpacity
        onPress={() => {
          this.handleUsernameTap(like.username, like.user_id);
        }}
        style={styles.likeButton}
        key={like.user_id}>
        <Layout style={[styles.likeContainer]}>
          {like.image ? (
            <Image style={[styles.likeImage]} source={{uri: like.image}} />
          ) : (
            <ThemedIcon name="person" size={40} />
          )}
          <Text>{like.name || like.username}</Text>
        </Layout>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a comment with pagination
   * */
  renderComment(c) {
    const {item} = c;
    const {
      childPropName,
      imageExtractor,
      usernameExtractor,
      childrenCountExtractor,
      keyExtractor,
      paginateAction,
      saveAction,
      parentIdExtractor,
    } = this.props;
    return (
      <Layout>
        {this.generateComment(item)}
        <Layout style={{marginLeft: 40}}>
          {item.childrenCount &&
          item[childPropName] &&
          item[childPropName][0] ? (
            <TouchableOpacity onPress={() => this.toggleExpand(item)}>
              <Layout style={styles.repliedSection}>
                <Image
                  style={styles.repliedImg}
                  source={{
                    uri: imageExtractor(item[childPropName][0]),
                  }}
                />
                <Text style={styles.repliedUsername}>
                  {' '}
                  {usernameExtractor(item[childPropName][0])}{' '}
                </Text>
                <Text style={styles.repliedText}>replied</Text>
                <Text style={styles.repliedCount}>
                  {' '}
                  * {childrenCountExtractor(item)}
                  {childrenCountExtractor(item) > 1 ? ' replies' : ' reply'}
                </Text>
              </Layout>
            </TouchableOpacity>
          ) : null}
          <Collapsible
            easing="easeOutCubic"
            duration={400}
            collapsed={!this.isExpanded(keyExtractor(item))}>
            {childrenCountExtractor(item) && paginateAction ? (
              <Layout>
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

                {this.renderChildren(item[childPropName])}

                {item[childPropName] &&
                childrenCountExtractor(item) > item[childPropName].length &&
                paginateAction ? (
                  <TouchableOpacity
                    onPress={() => this.paginate(item[childPropName], 'up')}>
                    <Text
                      style={{
                        textAlign: 'center',
                        paddingTop: 15,
                      }}>
                      Show more...
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </Layout>
            ) : null}
            <Layout style={styles.inputSection}>
              <Input
                ref={(input) => {
                  this.textInputs[`input${keyExtractor(item)}`] = input;
                }}
                style={styles.input}
                multiline
                onChangeText={(text) => {
                  this.replyCommentText = text;
                }}
                placeholder="Write comment"
              />
              <TouchableOpacity
                onPress={() => {
                  saveAction(this.replyCommentText, parentIdExtractor(item));
                  this.replyCommentText = null;
                  this.textInputs[`input${keyExtractor(item)}`].clear();
                  Keyboard.dismiss();
                }}>
                <ThemedIcon
                  style={styles.submit}
                  name="corner-down-right"
                  size={40}
                />
              </TouchableOpacity>
            </Layout>
          </Collapsible>
        </Layout>
      </Layout>
    );
  }

  render() {
    const {
      users,
      saveAction,
      data,
      initialDisplayCount,
      keyExtractor,
      commentCount,
      editAction,
      paginateAction,
    } = this.props;
    const {
      text,
      mentionList,
      loadingComments,
      commentsLastUpdated,
      editModalVisible,
    } = this.state;
    return (
      <Layout style={{flex: 1}}>
        <Layout style={styles.inputSection}>
          <Input
            style={styles.input}
            ref={(input) => {
              this.inputMain = input;
            }}
            multiline
            value={text}
            maxLength={280}
            onChangeText={(input) => {
              this.newCommentText = input;
              this.setState({text: input});
              // this.inputMain.setNativeProps({text: input});
              const list = getMentionsList(text, users);
              list
                ? this.setState({mentionList: list})
                : this.setState({mentionList: null});
            }}
            placeholder="Write comment..."
          />
          <TouchableOpacity
            onPress={() => {
              saveAction(this.newCommentText, null);
              this.newCommentText = null;
              this.setState({text: null});
              this.inputMain.clear();
              Keyboard.dismiss();
            }}>
            <ThemedIcon
              style={styles.submit}
              name="corner-down-right"
              size={30}
            />
          </TouchableOpacity>
        </Layout>
        {mentionList && (
          <Layout style={styles.mentionsList}>
            <List
              ItemSeparatorComponent={Divider}
              keyboardShouldPersistTaps="handled"
              data={mentionList}
              style={{}}
              keyExtractor={(item) => item.uid}
              renderItem={({item, index}) => {
                if (index < 10) {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        const split = text.split(' ');
                        split[split.length - 1] = `@${item.username} `;
                        this.setState(
                          {text: split.join(' '), mentionList: null},
                          () => {
                            this.newCommentText = text;
                          },
                        );
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                      }}>
                      {item.avatar ? (
                        <Image
                          source={{uri: item.avatar}}
                          style={{height: 30, width: 30, borderRadius: 15}}
                        />
                      ) : (
                        <ThemedIcon name="person" size={35} />
                      )}
                      <Text style={{marginLeft: 10}}>{item.username}</Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              }}
            />
          </Layout>
        )}
        {!loadingComments && !data ? (
          <Text style={{textAlign: 'center'}}>No comments yet</Text>
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
        {data ? (
          <List
            ItemSeparatorComponent={Divider}
            keyboardShouldPersistTaps="always"
            style={{}}
            data={data}
            extraData={commentsLastUpdated}
            initialNumToRender={initialDisplayCount || 999}
            keyExtractor={(item) => keyExtractor(item)}
            renderItem={this.renderComment}
          />
        ) : null}

        {loadingComments ? (
          <Layout
            style={{
              position: 'absolute',
              zIndex: 10,
              bottom: 0,
              height: 60,
            }}>
            <Spinner size="small" />
          </Layout>
        ) : null}

        {!loadingComments &&
        data &&
        data.length < commentCount &&
        paginateAction ? (
          <TouchableOpacity
            style={{height: 70}}
            onPress={() => {
              this.paginate(data, 'up');
            }}>
            <Text style={{textAlign: 'center'}}>Show more</Text>
          </TouchableOpacity>
        ) : null}
        <Modal
          animationType="slide"
          onShow={() => {
            this.textInputs.editCommentInput.focus();
          }}
          transparent
          visible={editModalVisible}
          onRequestClose={() => this.setEditModalVisible(false)}>
          <Layout style={styles.editModalContainer}>
            <Layout style={styles.editModal}>
              <Input
                ref={(input) => {
                  this.textInputs.editCommentInput = input;
                }}
                style={styles.input}
                multiline
                defaultValue={this.editCommentText}
                onChangeText={(text) => {
                  this.editCommentText = text;
                }}
                placeholder="Edit comment"
              />
              <Layout
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <TouchableOpacity
                  onPress={() => this.setEditModalVisible(false)}>
                  <Layout style={styles.editButtons}>
                    <Text>Cancel</Text>
                    <Icon name="times" size={20} />
                  </Layout>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    editAction(this.editCommentText, this.editingComment);
                    this.setEditModalVisible(!editModalVisible);
                  }}>
                  <Layout style={styles.editButtons}>
                    <Text>Save</Text>
                    <Icon name="send" size={20} />
                  </Layout>
                </TouchableOpacity>
              </Layout>
            </Layout>
          </Layout>
        </Modal>
      </Layout>
    );
  }
}
