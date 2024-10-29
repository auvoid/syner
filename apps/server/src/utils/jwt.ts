import { sign, verify } from 'jsonwebtoken';

export const createJsonWebToken = (
  payload: Record<string, unknown>,
  expiresIn: string | number = '1h',
) => {
  return sign(payload, process.env.SESSION_SECRET, { expiresIn });
};

export const validateJsonWebToken: <T = any>(
  token: string,
) => { payload: T | null; expired: boolean } = <T = any>(token: string) => {
  try {
    const payload = verify(token, process.env.SESSION_SECRET) as T;
    return { payload, expired: false };
  } catch (error) {
    return {
      payload: null,
      expired: error.message.includes('token expired'),
    };
  }
};
