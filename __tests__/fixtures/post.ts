import Post, { PostType } from '../../app/types/Post'

const post: Post = {
    createdAt: 'Sun Jan 12 2020 16:17:46 GMT+0000 (Greenwich Mean Time)',
    type: PostType.PHOTO,
    uid: 'qwerty',
    username: 'mouleee'
}

export const feed =  {
    test: post
}

export default post