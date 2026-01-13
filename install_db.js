import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 开始执行全新数据库安装 (Fresh Install)...');

// 1. 重建 Prisma 文件夹
if (!fs.existsSync('prisma')) {
    fs.mkdirSync('prisma');
    console.log('📂 prisma 文件夹已创建');
}

// 2. 写入硬编码的 schema (跳过 .env)
const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://neondb_owner:npg_MxKYSnXD2b8F@ep-fancy-frog-ahrdh5bh.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
}`;

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ schema.prisma 已生成');

// 3. 写入种子数据
const seed = `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始写入初始数据...')
  await prisma.user.createMany({
    data: [
      { username: 'ekko', password: 'ekko123', role: 'user' },
      { username: 'admin', password: '123456', role: 'admin' }
    ],
    skipDuplicates: true
  })
  console.log('✅ 数据写入成功 (已跳过重复项)')
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })`;

fs.writeFileSync('prisma/seed.ts', seed);
console.log('✅ seed.ts 已生成');

// 4. 执行
try {
  console.log('🔄 正在推送数据库结构 (db push)...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('🔄 正在填充数据 (seeding)...');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  
  console.log('🎉 数据库安装全部完成！');
} catch (e) {
  console.error('❌ 安装失败:', e.message);
  process.exit(1);
}