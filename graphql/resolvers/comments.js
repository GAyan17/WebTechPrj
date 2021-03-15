import { AuthenticationError, UserInputError } from 'apollo-server-errors';

import checkAuth from '../../utils/check_auth';
import Post from '../../models/Post';


export const Mutation = {
    createComment: async (_, { postId, body }, context) => {
        const user = checkAuth(context);
        if (body.trim() === '') {
            throw new UserInputError('Empty comment', {
                errors: {
                    body: 'Comment body must not be empty'
                }
            });
        }

        const post = await Post.findById(postId);

        if (post) {
            post.comments.unshift({
                body,
                username,
                createdAt: new Date().toISOString(),
            });
            await post.save();
            return post;
        } else {
            throw new UserInputError('Post Not Found');
        }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
        const { username } = checkAuth(context);

        const post = await Post.findById(postId);

        if (post) {
            const commentIdx = post.comments.findIndex(c => c.id === commentId);

            if (post.comments[commentIdx].username === username) {
                post.comments.splice(commentIdx, 1);
                await post.save();
                return post;
            } else {
                throw new AuthenticationError('Action Not Allowed')
            }
        } else {
            throw new UserInputError('Post Not Found');
        }
    }
};