import { type ValueOf, type DeepValueOf } from './types.js';

// Error Code enum
export const ErrorCode = {
    DB: {   // [DB] Data Base
        NOT_FOUND: 'DB_NOT_FOUND',
    },
    USER: { // [USER] User
        USERNAME_ILLEGAL:           'USER_USERNAME_ILLEGAL',            // 使用者名稱不合規
        USERNAME_ALREADY_EXISTS:    'USER_USERNAME_ALREADY_EXISTS',     // 使用者名稱已存在
        USERNAME_NOT_FOUND:         'USER_USERNAME_NOT_FOUND',          // 使用者名稱未找到
    },
    /*
    AA: {...}
    */
} as const;

// type
export type ErrorCode = DeepValueOf<typeof ErrorCode>;

// class for instance
export class AppError extends Error {
    constructor(
        public readonly code: ErrorCode,
        message?: string
    ) {
        super(message || code);
    }
};