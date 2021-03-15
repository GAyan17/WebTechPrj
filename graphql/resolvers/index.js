import postResolvers from './posts';
import userResolvers from './users';
import commentsResolvers from './comments';

export default {
    Post: {
        likeCount: (parent) => {
            // console.log(parent);
            return parent.likes.length;
        },
        commentCount: (parent) => {
            return parent.comments.length;
        }
    },
    Query: {
        ...postResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...postResolvers.Mutation,
        ...commentsResolvers.Mutation,
    },
    Subscription: {
        ...postResolvers.Subscription
    }
}