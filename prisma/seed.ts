/**
 * 文件名: seed.ts
 * 功能: 数据库种子脚本 (Seeding)。
 * 核心逻辑:
 * 1. 初始化 Prisma Client。
 * 2. 清理现有用户数据 (防止重复)。
 * 3. 插入预设的初始用户数据。
 */

// @ts-ignore
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // 先清除数据以防止如果表存在时的重复/错误
  try { 
    await prisma.user.deleteMany() 
    console.log('Cleared existing users.')
  } catch(e) {
    console.log('Table might not exist yet, skipping delete.')
  }
  
  await prisma.user.createMany({
    data: [
      { username: 'ekko', password: 'ekko123', role: 'user' },
      { username: 'admin', password: '123456', role: 'admin' }
    ]
  })
  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    // 强制转换为 any 以避免 TS 错误
    ;(process as any).exit(1)
  })