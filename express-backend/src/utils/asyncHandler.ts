

import { Request, Response, NextFunction } from "express";

type AsyncHandlerFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncHandlerFn) =>
  (req: Request, res: Response, next: NextFunction):Promise<void> =>
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
    res
      .status(res.statusCode !== 200 ? res.statusCode : 500)
      .json({success:false, message: error.message });
  });;

export default asyncHandler;
