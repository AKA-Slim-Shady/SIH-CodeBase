import {
  createComment,
  updateComment,
  deleteComment,
  getComments,
} from "./comments.sqlquery.js";

export const createCommentController = createComment;
export const updateCommentController = updateComment;
export const deleteCommentController = deleteComment;
export const getCommentsController = getComments;
