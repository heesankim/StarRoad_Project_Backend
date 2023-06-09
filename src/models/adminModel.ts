import { UserType } from '../types/user';
import { db } from '../loaders/dbLoader';
import { TravelPlan } from '../types/travel';
import { Diary } from '../types/diary';
import { Comment } from '../types/comment';
import { TouristDestinationType } from '../types/destination';
import { AppError, CommonError } from '../types/AppError';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { rowToCamelCase } from '../util/rowToCamelCase';

/** [관리자] 모든 회원 정보 불러오기 */
export const getAllUsers = async (): Promise<UserType[]> => {
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute('SELECT * FROM user');
    return rows.map(rowToCamelCase);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '회원정보 불러오기에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 회원 정보 불러오기 */
export const getUser = async (id: number): Promise<UserType> => {
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(`SELECT * FROM user WHERE id = ?`, [id]);

    if (rows.length === 0) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, 'User not found', 404);
    }

    return rowToCamelCase(rows[0]);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '회원 정보 불러오기에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 회원 정보 업데이트 */
export const updateUserById = async (id: number, user: Partial<UserType>): Promise<UserType> => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { username, name, email, role } = user;

    await connection.execute('UPDATE user SET username = ?, name = ?, email = ?, role = ? WHERE id = ?', [
      username,
      name,
      email,
      role,
      id,
    ]);

    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM user WHERE id = ?', [id]);
    const updatedUser: UserType[] = rows.map(rowToCamelCase);

    await connection.commit();

    return updatedUser[0];
  } catch (error) {
    console.error(error);
    await connection.rollback();
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '회원정보 수정에 실패했습니다.', 500);
    }
  } finally {
    connection.release();
  }
};

/** [관리자] 회원 정보 삭제 */
export const deleteUserById = async (id: number): Promise<void> => {
  try {
    await db.execute('UPDATE user SET activated = 0 WHERE id = ?', [id]);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '회원 정보 삭제에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 회원이 작성한 일정 불러오기 */
export const getAllTravelPlansByUsername = async (username: string): Promise<TravelPlan[]> => {
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute('SELECT * FROM travel_plan WHERE username = ?', [
      username,
    ]);
    return rows.map(rowToCamelCase);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '회원 일정 불러오기에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 회원이 작성한 여행 장소 날짜 조회하기 */
export const getAllLocationsByPlanId = async (planId: number): Promise<TravelPlan[]> => {
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(
      'SELECT * FROM travel_location WHERE plan_id = ?',
      [planId]
    );
    return rows.map(rowToCamelCase);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '회원 일정 장소 및 날짜 조회에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 회원이 작성한 여행기 조회하기 */
export const getAllDiariesByUsername = async (username: string): Promise<Diary[]> => {
  try {
    const query = `
    SELECT td.*
    FROM travel_diary td
    JOIN travel_plan p ON td.plan_id = p.plan_id
    WHERE p.username = ?;
  `;
  const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(query, [username]);
    return rows.map(rowToCamelCase);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '회원이 작성한 여행기 조회에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 회원이 작성한 여행기 삭제하기 */
export const deleteDiaryByUsernameAndDiaryId = async (diaryId: number): Promise<void> => {
  try {
    await db.execute('DELETE FROM travel_diary WHERE id= ?', [diaryId]);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '회원의 여행기 삭제에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 회원이 작성한 여행기 댓글 모두 조회하기 */
export const getAllCommentsByUsernameAndDiaryId = async (username: string, diaryId: number): Promise<Comment[]> => {
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(
      'SELECT * FROM comment WHERE diary_id = ? AND username = ?',
      [diaryId, username]
    );
    return rows.map(rowToCamelCase);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '해당 여행기의 댓글 조회에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 특정 회원이 작성한 모든 댓글 조회하기 */
export const getAllCommentsByUsername = async (username: string): Promise<Comment[]> => {
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(
      `SELECT comment.id, comment.diary_id, comment.comment, comment.created_at, comment.updated_at
      FROM comment 
      WHERE comment.username = ?`,
      [username]
    );
    return rows.map(rowToCamelCase);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '해당 회원의 모든 댓글 조회에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 특정 회원이 작성한 댓글 삭제하기 */
export const deleteComment = async (
  commentId: number
): Promise<void> => {
  try {
    await db.execute('DELETE FROM comment WHERE id = ?', [
      commentId,
    ]);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '해당 회원의 댓글 삭제에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 관광지 추가 */
export const addTouristDestination = async (
destinationData: TouristDestinationType
): Promise<void> => {
  try {
    let correctedImage = '';

    if (destinationData.image) {
      correctedImage = Array.isArray(destinationData.image)
        ? destinationData.image[0]?.replace(/\\/g, '/')
        : destinationData.image.replace(/\\/g, '/');
    }
    await db.execute(
      'INSERT INTO travel_destination (name_en, name_ko, image, introduction, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
      [destinationData.nameEn, destinationData.nameKo, correctedImage, destinationData.introduction, destinationData.latitude, destinationData.longitude]
    );
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '관광지 추가에 실패했습니다.', 500);
    }
  }
};
/** [관리자] 관광지 이미지 파일명 조회하기 */
export const getTouristDestinationImage = async (id: string) => {
  const connection = await db.getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      'SELECT image FROM travel_destination WHERE id = ?',
      [id]
    );
    if (rows.length <= 0) {
      return null;
    } else {
      return rowToCamelCase(rows[0]);
    }

  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '이미지 정보를 가져오는 중에 오류가 발생했습니다.', 500);
    }
  }
};
/** [관리자] 관광지 수정하기 */
export const updateTouristDestination = async (id: string, updatedData: Partial<TouristDestinationType>): Promise<void> => {
  try {
    await db.execute(
      'UPDATE travel_destination SET name_en = ?, name_ko = ?, image = ?, introduction = ? WHERE id = ?',
      [updatedData.nameEn, updatedData.nameKo, updatedData.image, updatedData.introduction, id]
    );
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '관광지 수정에 실패했습니다.', 500);
    }
  }
};

/** [관리자] 관광지 삭제하기 */
export const deleteTouristDestination = async (id: string): Promise<object> => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT * FROM travel_destination WHERE id = ?`,
      [id]
    );
    const touristDestination = rowToCamelCase(rows[0]);

    await connection.execute(`DELETE FROM travel_destination WHERE id = ?`, [id]);
    await connection.commit();

    return touristDestination;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(CommonError.UNEXPECTED_ERROR, '관광제 삭제에 실패했습니다.', 500);
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
