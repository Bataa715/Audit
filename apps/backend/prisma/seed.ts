import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@golomt.bank' },
    update: {},
    create: {
      userId: 'ADMIN001',
      email: 'admin@golomt.bank',
      password: hashedPassword,
      name: 'Систем Админ',
      position: 'Систем Администратор',
      isAdmin: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create departments
  const departments = [
    {
      name: 'Удирдлага',
      description: 'Удирдлагын албаны хэлтэс',
      manager: 'TBD',
    },
    {
      name: 'Data анализын алба',
      description: 'Өгөгдлийн шинжилгээний хэлтэс',
      manager: 'TBD',
    },
    {
      name: 'Зээлийн аудит чанарын баталгаажуулалтын хэлтэс',
      description: 'Зээлийн аудитын чанарын баталгаажуулалт',
      manager: 'TBD',
    },
    {
      name: 'Мэдээллийн технологийн аудитын хэлтэс',
      description: 'IT аудитын хэлтэс',
      manager: 'TBD',
    },
    {
      name: 'Ерөнхий аудитын хэлтэс',
      description: 'Ерөнхий аудитын хэлтэс',
      manager: 'TBD',
    },
  ];

  for (const dept of departments) {
    const department = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    console.log('✅ Department created:', department.name);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
