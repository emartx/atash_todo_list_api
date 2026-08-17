import { Response } from "express";

export const parsePositiveInteger = (value: unknown): number | undefined => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
};

export const returnSuccess = (
  res: Response,
  data: unknown,
  message?: string
) => {
  let responseObj: { count?: number; data: unknown; message?: string } = {
    data,
    message,
  };
  if (Array.isArray(data)) {
    responseObj.count = data.length;
  }
  return res.status(200).json(responseObj);
};

export const returnFailure = (
  res: Response,
  status: number,
  message?: string
) =>
  res.status(status).json({
    message,
  });
