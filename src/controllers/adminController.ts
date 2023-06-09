import { Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';
import { CustomRequest } from '../types/customRequest';
import * as fs from 'node:fs/promises';
import { compressImage } from '../util/compressImage';
import config from '../config';
import path from 'node:path';
import { AppError, CommonError } from '../types/AppError';
import docs from '../types/controller';
const IMG_PATH = config.server.IMG_PATH;

/** [관리자] 모든 회원 조회하기 */
export const getAllUsers: typeof docs.getAllUsers = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers();
    if (!users) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '불러올 회원 정보가 없습니다.', 400);
    }
    const userCount: number = users.length;
    res.status(200).json({ data: { users, userCount, message: '모든 회원을 불러왔습니다.' } });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 특정 회원 조회하기 */
export const getUser: typeof docs.getUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      throw new AppError(CommonError.INVALID_INPUT, '입력값이 유효하지 않습니다.', 400);
    }

    const user = await adminService.getUser(Number(id));

    res.status(200).json({
      data: {
        user,
        message: '유저 조회에 성공하였습니다.',
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 회원 정보 업데이트 */
export const updateUser: typeof docs.updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { username, name, email, role } = req.body;

    if (isNaN(Number(id))) {
      throw new AppError(CommonError.INVALID_INPUT, '입력값이 유효하지 않습니다.', 400);
    }

    const user = await adminService.getUser(Number(id));

    if (!user) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '존재하지 않는 유저입니다.', 400);
    }
    if (role !== 'USER' && role !== 'ADMIN') {
      throw new AppError(CommonError.INVALID_INPUT, 'USER 혹은 ADMIN만 입력 가능합니다.', 400);
    }
    const userInfo = { username, name, email, role };

    const data = await adminService.updateUser(Number(id), userInfo);
    res.status(201).json({ data, message: '회원 정보 수정을 완료했습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 회원 삭제하기 */
export const deleteUser: typeof docs.deleteUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      throw new AppError(CommonError.INVALID_INPUT, '입력값이 유효하지 않습니다.', 400);
    }

    const user = await adminService.deleteUser(Number(id));
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 회원이 작성한 여행 일정 조회하기 */
export const getAllTravelPlansByUsername: typeof docs.getAllTravelPlansByUsername = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    if (!username) {
      throw new AppError(CommonError.INVALID_INPUT, '입력값이 유효하지 않습니다.', 400);
    }

    const userTravelInfos = await adminService.getAllTravelPlansByUsername(String(username));
    res.status(200).json({ data: userTravelInfos, message: '회원이 작성한 여행 일정을 조회했습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 회원이 작성한 날짜 장소 조회하기 */
export const getAllLocationsByPlanId: typeof docs.getAllLocationsByPlanId = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId } = req.params;

    if (!planId) {
      throw new AppError(CommonError.INVALID_INPUT, '입력값이 유효하지 않습니다.', 400);
    }

    const userTravelLocationInfos = await adminService.getAllLocationsByPlanId(Number(planId));

    res.status(200).json({ data: userTravelLocationInfos, message: '회원이 작성한 날짜별 장소를 조회했습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 회원이 작성한 여행기 모두 조회하기 */
export const getAllDiariesByUsername: typeof docs.getAllDiariesByUsername = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    const userTravelDiaryInfos = await adminService.getAllDiariesByUsername(String(username));

    res.status(200).json({ data: userTravelDiaryInfos, message: '회원이 작성한 여행기를 조회했습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 회원이 작성한 여행기 삭제하기 */
export const deleteDiaryByUsernameAndDiaryId: typeof docs.deleteDiaryByUsernameAndDiaryId = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { diaryId } = req.params;

    await adminService.deleteDiaryByUsernameAndDiaryId(Number(diaryId));
    res.status(200).json({ message: `DiaryId ${diaryId}가 성공적으로 삭제되었습니다.` });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 회원이 작성한 여행기의 댓글 모두 조회하기 */
export const getAllCommentsByUsernameAndDiaryId: typeof docs.getAllCommentsByUsernameAndDiaryId = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, diaryId } = req.params;

    const userTravelDiaryCommentInfos = await adminService.getAllCommentsByUsernameAndDiaryId(
      String(username),
      Number(diaryId)
    );

    res
      .status(200)
      .json({ data: userTravelDiaryCommentInfos, message: `${username} 회원이 작성한 여행기의 댓글을 조회했습니다.` });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
/**
 * [관리자] 회원이 작성한 모든 댓글 조회하기
 */
export const getAllCommentsByUsername: typeof docs.getAllCommentsByUsername = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    const userAllComments = await adminService.getAllCommentsByUsername(String(username));

    res.status(200).json({ data: userAllComments, message: `${username} 회원이 작성한 모든 댓글을 조회했습니다.` });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 특정 회원이 작성한 댓글 삭제하기 */
export const deleteComment: typeof docs.deleteComment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    await adminService.deleteComment(Number(commentId));
    res.status(200).json({
      message: `CommentID ${commentId}이 성공적으로 삭제되었습니다.`,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** [관리자] 관광지 추가 */
export const addTouristDestination: typeof docs.addTouristDestination = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let imgName: string[] = [];
  try {
    if (req.files?.length === 0) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '이미지 파일이 첨부되지 않았습니다.', 400);
    }
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      const promises = files.map(async (file) => {
        const inputPath = path.join(__dirname, '../../public', file.filename);
        const compressedPath = path.join(__dirname, '../../public/compressed', file.filename);

        await compressImage(inputPath, compressedPath, 600, 600);

        const compressedFilename = path.basename(compressedPath);
        const encodedFilename = encodeURIComponent(compressedFilename);

        imgName.push(`${IMG_PATH}/${encodedFilename}`);

        await fs.unlink(inputPath);
      });
      await Promise.all(promises);
    }
    const { nameEn, nameKo, introduction, latitude, longitude } = req.body;
    const destinationData = { nameEn, nameKo, introduction, latitude, longitude, image: imgName };
    await adminService.addTouristDestination(destinationData);
    res.status(200).json(destinationData);
  } catch (error) {
    console.error(error);
    if (req.files) {
      const deletePromises = (req.files as Express.Multer.File[]).map(async (file) => {
        const decodedFilename = decodeURIComponent(path.basename(file.filename));
        const publicPath = path.join(__dirname, '../../public', decodedFilename);
        const compressedPath = path.join(__dirname, '../../public/compressed', decodedFilename);
        try {
          await fs.unlink(publicPath);
        } catch (err) {
          console.error(err);
        }

        try {
          await fs.unlink(compressedPath);
        } catch (err) {
          console.error(err);
        }
      });
      await Promise.all(deletePromises);
    }
    next(error);
  }
};

/** [관리자] 관광지 수정하기 */
export const updateTouristDestination: typeof docs.updateTouristDestination = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let imgName: string[] = [];
  try {
    const { id } = req.params;
    const { nameEn, nameKo, introduction, latitude, longitude } = req.body;
    if (!id) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '관광지를 찾을 수 없습니다.', 400);
    }
    const originImage = await adminService.getTouristDestinationImage(id);
    if (originImage.image) {
      let imageArray: string[];

      if (typeof originImage.image === 'string') {
        try {
          imageArray = JSON.parse(originImage.image);
          if (!Array.isArray(imageArray)) {
            throw new Error();
          }
        } catch {
          imageArray = [originImage.image];
        }
      } else {
        imageArray = originImage.image;
      }
      for (const imageName of imageArray) {
        const url = new URL(imageName);
        const pathname = url.pathname;
        const baseDir = '/compressed/';
        const start = pathname.indexOf(baseDir);
        if (start === -1) {
          console.log('Failed to detect image:', imageName);
          continue;
        }
        const encodedFilename = pathname.substring(start + baseDir.length);
        const decodedPathname = decodeURIComponent(encodedFilename);
        const filename = path.join(__dirname, '../../public/compressed', decodedPathname);
  
        if (filename) {
          try {
            await fs.unlink(path.resolve(__dirname, '../../public/compressed', filename));
          } catch (err) {
            console.error(`Failed to delete image at ${imageName}: `, err);
            throw new AppError(CommonError.UNEXPECTED_ERROR, 'Failed to delete image', 500);
          }
        }
      }
    }

    if (req.files?.length === 0) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '이미지 파일이 첨부되지 않았습니다.', 400);
    }
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      const promises = files.map(async (file) => {
        const inputPath = path.join(__dirname, '../../public', file.filename);
        const compressedPath = path.join(__dirname, '../../public/compressed', file.filename);

        await compressImage(inputPath, compressedPath, 600, 600);

        const compressedFilename = path.basename(compressedPath);
        const encodedFilename = encodeURIComponent(compressedFilename);

        imgName.push(`${IMG_PATH}/${encodedFilename}`);

        await fs.unlink(inputPath);
      });
      await Promise.all(promises);
    }
    const updatedData = {
      nameEn,
      nameKo,
      introduction,
      latitude,
      longitude,
      image: imgName.join(),
    };

    await adminService.updateTouristDestination(id, updatedData);

    res.status(200).json(updatedData);
  } catch (error) {
    console.error(error);
    if (req.files) {
      const deletePromises = (req.files as Express.Multer.File[]).map(async (file) => {
        const decodedFilename = decodeURIComponent(path.basename(file.filename));
        const publicPath = path.join(__dirname, '../../public', decodedFilename);
        const compressedPath = path.join(__dirname, '../../public/compressed', decodedFilename);
        try {
          await fs.unlink(publicPath);
        } catch (err) {
          console.error(err);
        }

        try {
          await fs.unlink(compressedPath);
        } catch (err) {
          console.error(err);
        }
      });
      await Promise.all(deletePromises);
    }
    next(error);
  }
};

/** [관리자] 관광지 삭제하기 */
export const deleteTouristDestination: typeof docs.deleteTouristDestination = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedData = await adminService.deleteTouristDestination(String(id));
    if (!id) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '관광지를 찾을 수 없습니다.', 400);
    }
    if (Object.keys(deletedData).length === 0) {
      throw new AppError(CommonError.RESOURCE_NOT_FOUND, '관광지를 찾을 수 없습니다.', 400);
    }
    if (deletedData.image) {
      const imgName = deletedData.image.split('/compressed')[1];

      const filePath = path.join(__dirname, '../../public/compressed', imgName);
      const decodedPathname = decodeURIComponent(filePath)
      await fs.unlink(decodedPathname);
    }

    res.status(200).json({ deletedData });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
