import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Button, Confirm, Popup } from "semantic-ui-react";

import { FETCH_POSTS_QUERY } from "../utils/graphql";

function DeleteButton({ postId, callback, commentId }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;

  const [deletePostComment] = useMutation(mutation, {
    update(proxy) {
      setConfirmOpen(false);

      if (!commentId) {
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY,
        });
        data.getPosts = data.getPosts.filter((p) => p.id !== postId);
        proxy.writeQuery({
          query: FETCH_POSTS_QUERY,
          data,
        });
      }

      if (callback) {
        callback();
      }
    },
    variables: {
      postId,
      commentId,
    },
  });

  return (
    <>
      <Popup
        content={commentId ? "Delete Comment" : "Delete Post"}
        inverted
        trigger={<Button as="div" color="red" icon="trash" floated="right" onClick={() => setConfirmOpen(true)} style={{ margin: 0 }} />}
      />
      <Confirm open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={deletePostComment} />
    </>
  );
}

const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      comments {
        id
        username
        createdAt
        body
      }
      commentCount
    }
  }
`;

export default DeleteButton;
