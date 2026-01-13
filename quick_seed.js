import { neon } from '@neondatabase/serverless';

// 直接硬编码连接字符串，绕过 .env 文件
const databaseUrl = "postgresql://neondb_owner:npg_MxKYSnXD2b8F@ep-fancy-frog-ahrdh5bh.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(databaseUrl);

async function initDb() {
  console.log('🚀 [Seed] 正在初始化数据库连接 (Neon Serverless)...');
  
  // 设置 15 秒超时，防止网络卡死阻塞启动
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection timed out after 15s')), 15000)
  );

  try {
    await Promise.race([
      (async () => {
        // 1. 测试连接
        const version = await sql`SELECT version()`;
        console.log('📡 [Seed] 已连接到:', version[0].version);

        // 2. 创建用户表
        console.log('🔨 [Seed] 检查/创建 User 表...');
        await sql`
          CREATE TABLE IF NOT EXISTS "User" (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
          );
        `;
        
        // 3. 插入初始数据 (优化：仅当不存在时插入，不覆盖现有数据)
        console.log('🌱 [Seed] 检查初始数据完整性...');
        const usersToSeed = [
            { username: 'ekko', password: 'ekko123312', role: 'user' },
            { username: 'link', password: 'link123', role: 'user' },
            { username: 'mz',   password: 'mzmzmz',  role: 'user' }
        ];

        for (const user of usersToSeed) {
            // Check if user exists by username
            const existing = await sql`SELECT id FROM "User" WHERE username = ${user.username}`;
            
            if (existing.length === 0) {
                 const newId = crypto.randomUUID();
                 await sql`
                  INSERT INTO "User" (id, username, password, role)
                  VALUES (${newId}, ${user.username}, ${user.password}, ${user.role})
                 `;
                 console.log(`   - ✅ [Create] 创建新用户: ${user.username}`);
            } else {
                 // 优化：如果用户存在，跳过更新，保留数据库中的现有状态（如修改过的密码）
                 console.log(`   - ⏭️ [Skip] 用户已存在，跳过覆盖: ${user.username}`);
            }
        }
        
        // 4. 验证数据
        const count = await sql`SELECT count(*) FROM "User"`;
        console.log(`✅ [Seed] 数据验证: 当前共有 ${count[0].count} 个用户`);
        
        console.log('🎉 [Seed] 数据库检查完成！');
      })(),
      timeoutPromise
    ]);
    
    process.exit(0);
  } catch (error) {
    console.warn('⚠️  [Seed Warning] 数据库连接或初始化失败:', error.message);
    // 即使失败也允许通过，以免阻塞本地开发
    process.exit(0);
  }
}

initDb();