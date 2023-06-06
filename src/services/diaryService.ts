import {
  createDiaryById,
  getPlan,
  getAllDiaryById,
  getMyDiaryById,
  getOneDiaryById,
  updateDiaryById,
  deleteDiaryById,
} from '../models/diaryModel';
import { DiaryType } from '../types/diary';
import { AppError, CommonError } from '../api/middlewares/errorHandler';
import { TravelPlan } from '../types/travel';

export const createDiary = async (diary: DiaryType, user_id: string, plan_id: number) => {
  try {
    const plan = await getPlan(plan_id, user_id);
    if (!plan) {
      throw new AppError(CommonError.UNAUTHORIZED_ACCESS, '해당 일정에 대한 여행기를 작성할 권한이 없습니다.', 404);
    }
    const { destination } = plan; // 플랜의 destination 값
    diary.destination = destination;
    await createDiaryById(diary);
    return '여행기 생성이 완료되었습니다.';
  } catch (error) {
    console.error(error);
    throw new AppError(CommonError.UNEXPECTED_ERROR, '여행기 생성에 실패했습니다.', 500);
  }
};

export const getAllDiary = async (): Promise<DiaryType[]> => {
  try {
    const diary = await getAllDiaryById();
    return diary;
  } catch (error) {
    console.error(error);
    throw new AppError(CommonError.UNEXPECTED_ERROR, '전체 여행기 조회에 실패했습니다.', 500);
  }
};
export const getMyDiary = async (user_id: string): Promise<DiaryType[]> => {
  try {
    const diary = await getMyDiaryById(user_id);
    return diary;
  } catch (error) {
    console.error(error);
    throw new AppError(CommonError.UNEXPECTED_ERROR, '내 다이어리 조회에 실패했습니다.', 500);
  }
};
export const getOneDiary = async (diary_id: number): Promise<DiaryType | null> => {
  try {
    const diary = await getOneDiaryById(diary_id);
    return diary;
  } catch (error) {
    console.error(error);
    throw new AppError(CommonError.UNEXPECTED_ERROR, '여행기 조회에 실패했습니다.', 500);
  }
};

export const updateDiary = async (newDiary: DiaryType, diary_id: number, user_id: string) => {
  try {
    const diary = await getOneDiaryById(diary_id);
    if (!diary) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '여행기를 찾을 수 없습니다.', 404);
    }
    if (diary.user_id !== user_id) {
      throw new AppError(CommonError.UNAUTHORIZED_ACCESS, '권한이 없습니다.', 403);
    }

    await updateDiaryById(newDiary, diary_id);

    return '여행기 업데이트가 완료되었습니다.';
  } catch (error) {
    console.error(error);
    throw new AppError(CommonError.UNEXPECTED_ERROR, '여행기 업데이트에 실패했습니다.', 500);
  }
};

export const deleteDiary = async (diary_id: number, user_id: string) => {
  try {
    const diary = await getOneDiaryById(diary_id);
    if (!diary) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '여행기를 찾을 수 없습니다.', 404);
    }
    if (diary.user_id !== user_id) {
      throw new AppError(CommonError.UNAUTHORIZED_ACCESS, '권한이 없습니다.', 403);
    }

    await deleteDiaryById(diary_id);

    return '여행기 삭제가 완료되었습니다.';
  } catch (error) {
    console.error(error);
    throw new AppError(CommonError.UNEXPECTED_ERROR, '여행기 삭제에 실패했습니다.', 500);
  }
};
