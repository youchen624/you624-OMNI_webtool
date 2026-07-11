import { type ValueOf, type DeepValueOf } from './types.js';

// Error Code enum
export const ErrorCode = {
    DB: {   // [DB] Data Base
        NOT_FOUND: 'DB_NOT_FOUND',
    },
    USER: { // [USER] User
        USERNAME_ILLEGAL:   'USER_USERNAME_ILLEGAL',    // 使用者名稱不合規
        ALREADY_EXISTS:     'USER_ALREADY_EXISTS',      // 使用者名稱已存在
        NOT_FOUND:          'USER_NOT_FOUND',           // 使用者名稱未找到
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