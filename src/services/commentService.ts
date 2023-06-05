import { 
    createCommentModel,
    getCommentsByDiaryModel,
    getAllCommentsModel,
    updateCommentModel,
    getCommentModel

} from '../models/commentModel';

import { CommentType } from '../types/comment';
import { AppError } from '../api/middlewares/errorHandler';

export const createComment = async (comment: CommentType): Promise<void> => {
  try {
    const { user_id, diary_id, comment: commentText } = comment;

    await createCommentModel({ user_id, diary_id, comment: commentText });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new Error('댓글 생성 실패했습니다.');
    }
  }
};
export const getCommentsByDiary = async (diary_id: number, page: number, limit: number): Promise<CommentType[]> => {
    const comments = await getCommentsByDiaryModel(diary_id, page, limit); // pagination 적용
    return comments;
  };
  
  export const getAllComments = async (): Promise<CommentType[]> => {
    try {
      const comments = await getAllCommentsModel();
      return comments;
    } catch (error) {
      throw new Error('댓글 조회에 실패했습니다.');
    }
  };
  export const updateComment = async (newComment: CommentType, comment_id: number, user_id: string): Promise<void> => {
    try {
      const existingComment = await getCommentModel(comment_id);
      if (!existingComment) {
        throw new AppError('존재하지 않는 댓글입니다.', 404);
      }
  
      if (existingComment.user_id !== user_id) {
        throw new AppError('댓글을 수정할 권한이 없습니다.', 403);
      }
  
      await updateCommentModel(comment_id,newComment);
      
    } catch (error) {
      throw new Error('댓글 수정에 실패했습니다.');
    }
  };