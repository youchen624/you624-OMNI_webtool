import { type ValueOf } from './types.js';
import { DB } from './db.js';
import { AppError, ErrorCode } from './errors.js';
import argon2 from 'argon2';

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
        create_at: new Date(row.create_at),
        auth_at: new Date()
    };
};

export const Users = {
    // UserName prefix black list
    USERNAME_PREFIX_BLACK_LIST: [
        'admin',
        'test',
        'guest',
        'del_'
    ] as const,

    // Password Services // using argon2
    PSW: {
        // hash a password
        async hash(password: string): Promise<string> {
            return await argon2.hash(password);
        },
        // verify a password by hash
        async verify(password: string, password_hash: string): Promise<boolean> {
            return await argon2.verify(password_hash, password);
        },
    },

    // get User by ID
    async getByID(id: number): Promise<User | null> {
        const PG_SQL = `
            SELECT id, username, state, create_at FROM users WHERE id = $1;
        `;
        try {
            const results = await DB.pg_query(PG_SQL, [id]);
            if(!results.length) return null;
            return user_fromRow(results[0]);
        } catch(e: any) {
            console.error(`[Users][DB]getByID❌:\n`, e);
            throw e;
        };
    },
    
    // auth User by login
    async auth(username: string, password: string): Promise<User | null> {
        const PG_SQL = `
            SELECT id, username, password_hash, state, create_at FROM users WHERE username = $1 AND state = $2;
        `;
        try {
            const results = await DB.pg_query(PG_SQL, [username, UserState.Active]);
            if (!results.length) return null; // throw new AppError(ErrorCode.USER.NOT_FOUND);
            if (await Users.PSW.verify(password, results[0].password_hash)) {
                return user_fromRow(results[0]);
            } else return null;
        } catch(e: any) { throw e; };
    },

    // PSW change
    async password_update(user: User, password_new: string): Promise<User> {
        const PG_SQL = `
            UPDATE users SET password_hash = $2
            WHERE id = $1
            RETURNING id;
        `;
        try {
            const password_hash = await Users.PSW.hash(password_new);
            const results = await DB.pg_query(PG_SQL, [user.id, password_hash]);
            if (results.length) return user;
            else throw new AppError(ErrorCode.USER.NOT_FOUND);
        } catch(e: any) {
            console.error(`[Users][DB]PasswordUpdating❌:\n`, e);
            throw e;
        };
    },

    // create User
    async create(username: string, password: string): Promise<User> {
        const PG_SQL = `
            INSERT INTO users (username, password_hash, state)
            VALUES ($1, $2, $3)
            RETURNING id, username, state, create_at;
        `;
        try {
            const password_hash = await Users.PSW.hash(password);
            const results = await DB.pg_query(PG_SQL, [username, password_hash, UserState.Active]);
            return user_fromRow(results[0]);
        } catch(e: any) {
            console.error(`[USERS][DB]Create❌:\n`, e);
            if (e.code !== '23505') throw e;
            throw new AppError(ErrorCode.USER.ALREADY_EXISTS);
        };
    },

    // change User state
    async state_set(user: User, state: UserState): Promise<User> {
        const PG_SQL = `
            UPDATE users SET state = $2 WHERE id = $1
            RETURNING id, username, state, create_at;
        `;
        try {
            const results = await DB.pg_query(PG_SQL, [user.id, state]);
            if (!results.length) throw new AppError(ErrorCode.USER.NOT_FOUND);
            return user_fromRow(results[0]);
        } catch(e) {
            console.error(`[Users][DB]StateSetting❌:\n`, e);
            throw e;
        };
    },

    // delete User (soft)
    async delete_soft(user: User): Promise<boolean> {
        const PG_SQL = `
            UPDATE users SET
                state = $2,
                username = 'del_' || FLOOR(EXTRACT(EPOCH FROM NOW())) || '_' || username
            WHERE id = $1 AND state != $2
            RETURNING id, username, state;
        `;
        try {
            const results = await DB.pg_query(PG_SQL, [user.id, UserState.Deleted]);
            return !!results.length;
        } catch(e: any) {
            return false;
        }
    },
};


// Users begin initialization
(async (): Promise<void> => {
    const PG_SQL = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(64) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            state SMALLINT NOT NULL DEFAULT 0,
            create_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    `;      // users: { id, username, password_hash, state, create_at }
    // username max: 16
    /*
    CREATE TABLE IF NOT EXISTS users_info (
        id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        update_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users_setting (
        id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        update_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    */
    // email VARCHAR(100) UNIQUE NOT NULL,
    try {
        await DB.pg_query(PG_SQL);
        console.log(`[Users][DB]Initialization✅ successful`);
    } catch(e) {
        console.error(`[Users][DB]Initialization❌ failed:\n`, e);
        throw e;
    };
})();