import { Pool, type QueryResult } from 'pg';
import { type ValueOf } from './types.js';

const pool_PostgreSQL = new Pool({
    connectionString: 'postgresql://omni_admin:omni_password123@localhost:5432/omni_core_db',
    max: 10,
    idleTimeoutMillis: 30000,
});

pool_PostgreSQL.on('error', (err) => {
    console.error("Unexpected error on idle database client", err);
});

// Users Accounts State
export const AccountState = {
    Active: 1,
    Deleted: 2,
    Suspension: 3,
};
export type AccountState = ValueOf<typeof AccountState>;

// Sex Type
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

const DB = {
    /**
     * PG通用查詢方法
     * @param {string} text   PG-SQL
     * @param {Array}  params params
     * @returns {Promise}
     */
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
    */
    async initTable(): Promise<void> {
        const PG_SQL = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                state SMALLINT NOT NULL DEFAULT 0,
                cerated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
     * - Create
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
     */
    async user_create(username: string, password_hash: string): Promise<void> {
        const PG_SQL= `
            INSERT INTO users (username, password_hash, state)
            VALUES ($1, $2, $3)
        `;
        try {
            await DB.pg_query(PG_SQL, [username, password_hash, AccountState.Active]);
            console.log(`[DB]✅成功創建新帳號: '${username}'`);
        } catch(e: any) {
            // if (e.code === '23505')
                // throw new Error(`d`);
                // already exists
            throw e;
        };
    },
};

export default DB;