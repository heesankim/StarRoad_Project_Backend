import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).send({
    error: {
      message: err.message,
    },
  });
};

export default errorHandler;
