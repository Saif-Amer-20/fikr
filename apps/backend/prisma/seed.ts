/*
 * سكربت تهيئة قاعدة البيانات بالبيانات التجريبية.
 * يمكن تشغيله بواسطة: npx ts-node prisma/seed.ts
 */
// seed.ts

const { PrismaClient, IdeaStatus, IdeaStage } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // إنشاء الأذونات الأساسية
  const permissions = [
    { key: 'idea:create', description: 'إنشاء فكرة' },
    { key: 'idea:read', description: 'قراءة الأفكار' },
    { key: 'idea:update', description: 'تعديل الأفكار' },
    { key: 'idea:delete', description: 'حذف الأفكار' },
    { key: 'idea:approve', description: 'اعتماد الأفكار' },
    { key: 'vote:cast', description: 'التصويت على فكرة' },
    { key: 'comment:write', description: 'كتابة تعليق' },
    { key: 'user:manage', description: 'إدارة المستخدمين' },
    { key: 'role:manage', description: 'إدارة الأدوار' },
    { key: 'challenge:manage', description: 'إدارة التحديات' },
    { key: 'survey:manage', description: 'إدارة الاستبيانات' }
  ];

  await prisma.permission.createMany({ data: permissions });

  // إنشاء الأدوار وربط الأذونات
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'مدير النظام',
      permissions: {
        create: permissions.map((p) => ({ permission: { connect: { key: p.key } } }))
      }
    }
  });

  const employeeRole = await prisma.role.create({
    data: {
      name: 'employee',
      description: 'موظف عادي',
      permissions: {
        create: [
          { permission: { connect: { key: 'idea:create' } } },
          { permission: { connect: { key: 'idea:read' } } },
          { permission: { connect: { key: 'vote:cast' } } },
          { permission: { connect: { key: 'comment:write' } } }
        ]
      }
    }
  });

  // إنشاء مستخدمين (مدير وموظف)
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      name: 'مدير النظام',
      email: 'admin@fikr.local',
      department: 'الإدارة العامة',
      roleId: adminRole.id,
      isActive: true,
      // كلمة مرور مشفّرة تُحفظ في جدول منفصل أو حقل مخصص. لا يتم حفظها هنا بسبب نموذج Prisma الحالي.
    }
  });

  await prisma.user.create({
    data: {
      name: 'موظف تجريبي',
      email: 'employee@fikr.local',
      department: 'الشؤون الإدارية',
      roleId: employeeRole.id,
      isActive: true,
    }
  });

  // إنشاء أفكار تجريبية
  for (let i = 1; i <= 10; i++) {
    await prisma.idea.create({
      data: {
        title: `فكرة رقم ${i}`,
        summary: `هذا ملخص قصير للفكرة رقم ${i}`,
        details: `تفاصيل مفصّلة عن فكرة رقم ${i}. يمكن إضافة المزيد من المعلومات حول الفكرة هنا.`,
        category: 'تحسينات إدارية',
        owner: {
          connect: { email: 'employee@fikr.local' }
        },
        status: IdeaStatus.mursala,
        stage: IdeaStage.muqadama,
        score: 0
      }
    });
  }

  // إنشاء تحدٍّ واحد
  await prisma.challenge.create({
    data: {
      title: 'تحدي أفضل فكرة لشهر رمضان',
      description: 'قدّم فكرتك المميزة لتحسين بيئة العمل خلال شهر رمضان.',
      startAt: new Date(),
      endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
      rulesJson: {},
      maxVotesPerUser: 3
    }
  });

  // إنشاء استبيان واحد
  await prisma.survey.create({
    data: {
      title: 'استبيان رضا الموظفين',
      description: 'استبيان لقياس مستوى الرضا الوظيفي.',
      schemaJson: {
        questions: [
          { text: 'ما مدى رضاك عن بيئة العمل؟', type: 'rating', scale: 5 },
          { text: 'هل لديك مقترحات لتحسين بيئة العمل؟', type: 'text' }
        ]
      },
      active: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });