// @ts-ignore
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // Clear first to prevent duplicates/errors if table exists
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
    // Cast process to any to avoid TS error
    ;(process as any).exit(1)
  })