import { Pool, type QueryResult } from 'pg';
import { type ValueOf } from './types.js';
import { AppError, ErrorCode } from './errors.js';

const pool_PostgreSQL = new Pool({
    connectionString: 'postgresql://omni_admin:omni_password123@localhost:5432/omni_core_db',
    max: 10,
    idleTimeoutMillis: 30000,
});

pool_PostgreSQL.on('error', (err) => {
    console.error("Unexpected error on idle database client", err);
});



export const DB = {
    async pg_query<T= any>(text: string, params?: any[]): Promise<T[]> {
        const res = await pool_PostgreSQL.query(text, params);
        return res.rows as T[];
    },
};

/*
const DB = {
    /**
     * PG通用查詢方法
     * @param {string} text   PG-SQL
     * @param {Array}  params params
     * @returns {Promise}
     * /
    pg_query: async (text: string, params?: any[]): Promise<QueryResult> => {
        try {
            const result = await pool_PostgreSQL.query(text, params);
            return result;
        } catch(e) {
            console.error(`[DB]❌PG query error:\n`, e);
            throw e;
        };
    },

    /**
     * PostgreSQL initialization
     * @returns {void}
    * /
    async initTable(): Promise<void> {
        const PG_SQL = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                state SMALLINT NOT NULL DEFAULT 0,
                cerate_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;      // { id, username, password_hash, state, created_at }
        // email VARCHAR(100) UNIQUE NOT NULL,
        try {
            await this.pg_query(PG_SQL);
            console.log(`[DB]✅資料庫初始化成功`);
        } catch(e) {
            console.error(`[DB]❌資料庫初始化錯誤:\n`, e);
            throw e;
        };
    },

    /**
     * # Users
     * - Create Account
     * @returns {User} User
     * @todo change psw_hash to a type that:
     * @code ```ts
     * export type PasswordHash = string & { readonly __brand: unique symbol };
     * export async function hashPassword(passwordPlain: string): Promise<PasswordHash> {
     *   // bcrypt
     *   const salt = "$2b$10$abcdefghijklmnopqrstuv";
     *   const hashed = passwordPlain + salt;
     *   return hashed as PasswordHash;
     * }
     * ```
     * /
    async user_create(username: string, password_hash: string): Promise<User> {
        USERNAME_BLACK_LIST.some(banWord => {   // illegal prefix detecting
            if (username.startsWith(banWord)) throw new AppError(ErrorCode.USER.USERNAME_ILLEGAL);
        });
        const PG_SQL = `
            INSERT INTO users (username, password_hash, state)
            VALUES ($1, $2, $3);
        `;
        try {
            const result = await DB.pg_query(PG_SQL, [username, password_hash, AccountState.Active]);
            const row = result.rows[0];
            console.log(`[DB]✅成功創建新帳號: \`${username}\`, ID: \`${row.id}\``);
            return user_fromRow(row);   // row => User
        } catch(e: any) {
            if (e?.code === '23505')    // already exists
                throw new AppError(ErrorCode.USER.USERNAME_ALREADY_EXISTS);
            throw e;
        };
    },

    /**
     * # Users
     * - Auth Account
     * @param {string} username      User Name
     * @param {string} password_hash PSW Hash
     * /
    async user_auth(username: string, password_hash: string): Promise<User | null> {
        const PG_SQL = `
            SELECT id, username, state, create_at FROM users WHERE state = $1;
        `;
        try {
            const result = await this.pg_query(PG_SQL, [AccountState.Active]);
            if (!result.rowCount) return null;
            //  @TODO Verify the PSW
            return user_fromRow(result.rows[0]);
        } catch(e: any) {
            throw e;
        }
    },

    /**
     * # Users
     * - Delete Account
     * @param
     * /

    /**
     * # Users
     * - Change Account PSW
     * @param {string}
     * /
};
*/

export default DB;