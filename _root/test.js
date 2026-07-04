const { Client } = require('pg');

const connectionString = 'postgresql://omni_admin:omni_password123@localhost:5432/omni_core_db';

const client = new Client({
  connectionString: connectionString,
});

async function connectDB() {
  try {
    await client.connect();
    console.log('====== 🎉 OMNI 伺服器成功連線至 PostgreSQL ======');

    const res = await client.query('SELECT NOW();');
    console.log('資料庫回應目前時間：', res.rows[0].now);

  } catch (error) {
    console.error('❌ 連線失敗，發生錯誤：', error.stack);
  } finally {
    await client.end();
    console.log('==============================================');
  }
}

connectDB();