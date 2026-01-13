import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 开始自动修复数据库系统...');

// 1. 强行创建 prisma 文件夹
if (!fs.existsSync('prisma')) {
    fs.mkdirSync('prisma');
    console.log('📂 prisma 文件夹已创建');
}

// 2. 重建 schema.prisma
const schemaContent = `generator client {
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

fs.writeFileSync('prisma/schema.prisma', schemaContent);
console.log('✅ schema.prisma 配置文件已重建');

// 3. 重建 seed.ts (防止文件丢失导致后续命令失败)
const seedContent = `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')
  try { 
    await prisma.user.deleteMany() 
  } catch(e) {
    console.log('No existing table found, skipping cleanup.')
  }
  
  await prisma.user.createMany({
    data: [
      { username: 'ekko', password: 'ekko123', role: 'user' },
      { username: 'admin', password: '123456', role: 'admin' }
    ]
  })
  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => { 
      console.error(e); 
      await prisma.$disconnect(); 
      process.exit(1) 
  })`;

fs.writeFileSync('prisma/seed.ts', seedContent);
console.log('✅ seed.ts 种子文件已重建');

// 4. 执行数据库推送和填充
try {
  console.log('🔄 正在推送数据库结构 (db push)...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ 数据库结构同步成功！');

  console.log('🌱 正在写入初始数据 (seeding)...');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  console.log('🎉 所有修复操作已完成！');
} catch (error) {
  console.error('❌ 修复过程中出错:', error.message);
  process.exit(1);
}