export default interface Rep {
  date: string;
  post: string;
  parentCommentId?: string;
  type: RepType;
  uid: string;
}

export enum RepType {
  COMMENT = 'comment',
  POST = 'post',
}
