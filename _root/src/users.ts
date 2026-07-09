import { DB } from './db.js';
import { type ValueOf } from './types.js';

// Users begin initialization
(async (): Promise<void> => {
    const PG_SQL = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            state SMALLINT NOT NULL DEFAULT 0,
            cerate_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;      // { id, username, password_hash, state, create_at }
    // email VARCHAR(100) UNIQUE NOT NULL,
    try {
        await DB.pg_query(PG_SQL);
        console.log(`[Users][DB]Initialization✅ successful`);
    } catch(e) {
        console.error(`[Users][DB]Initialization❌ failed:\n`, e);
        throw e;
    };
})();

// User type
export type User = {
    id: number,
    username: string,
    state: UserState,
    create_at: Date,
    auth_at: Date
};

// User State
export const UserState = {
    Active: 1,      // 啟用
    Deleted: 2,     // 刪除
    Suspension: 3,  // 暫停
};
export type UserState = ValueOf<typeof UserState>;

// User Sex Type
export const SexType = {
    Male: 1,
    Female: 2,
    Other: 3
};
export type SexType = ValueOf<typeof SexType>;

// User Blood Type
export const BloodType = {
    A: 1,
    B: 2,
    O: 3,
    AB: 4,
};
export type BloodType = ValueOf<typeof BloodType>;

// User Blood Factor
export const BloodFactor = {
    Positive: 1,
    Negative: 2,
};
export type BloodFactor = ValueOf<typeof BloodFactor>;




// User row to User interface
function user_fromRow(row: any): User {
    return {
        id: row.id,
        username: row.username,
        state: row.state,
        create_at: row.create_at,
        auth_at: row.create_at
    };
};

export const Users = {
    USERNAME_BLACK_LIST: [
        'admin',
        'test',
        'guest',
        'del_'
    ] as const,
    async getByID(id: number): Promise<User | null> {},
    async auth(username: string, password_hash: string): Promise<User | null> {},
};

