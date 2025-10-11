/*
 * سكربت تهيئة قاعدة البيانات بالبيانات التجريبية.
 * يمكن تشغيله بواسطة: npx ts-node prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Comprehensive dummy ideas data covering all stages
  const ideasData = [
    // Stage: muqadama (مُقدمة - submission)
    {
      title: 'تطوير تطبيق موبايل للخدمات الحكومية',
      summary: 'إنشاء تطبيق موبايل يجمع جميع الخدمات الحكومية في مكان واحد لتسهيل الوصول للمواطنين',
      details: 'يهدف هذا المشروع إلى تطوير تطبيق موبايل شامل يتيح للمواطنين الوصول إلى جميع الخدمات الحكومية من خلال واجهة واحدة سهلة الاستخدام. سيشمل التطبيق خدمات مثل تجديد الوثائق، دفع الغرامات، حجز المواعيد، والاستعلام عن المعاملات.',
      category: 'التكنولوجيا',
      status: 'mursala',
      stage: 'muqadama',
      ownerId: 2,
      score: 15
    },
    {
      title: 'مبادرة التحول الرقمي للمدارس',
      summary: 'برنامج شامل لرقمنة العملية التعليمية وتوفير منصات التعلم الإلكتروني',
      details: 'تهدف هذه المبادرة إلى تحويل المدارس إلى بيئة رقمية متكاملة تشمل الفصول الذكية، المناهج الرقمية، وأنظمة إدارة التعلم. سيتم تدريب المعلمين على استخدام التقنيات الحديثة وتوفير الأجهزة اللازمة للطلاب.',
      category: 'التعليم',
      status: 'mursala',
      stage: 'muqadama',
      ownerId: 3,
      score: 12
    },
    
    // Stage: taqyeem_alaqran (تقييم الأقران - peer_feedback)
    {
      title: 'منصة الذكاء الاصطناعي للتشخيص الطبي',
      summary: 'استخدام الذكاء الاصطناعي لمساعدة الأطباء في التشخيص السريع والدقيق للأمراض',
      details: 'تطوير منصة ذكية تستخدم خوارزميات التعلم العميق لتحليل الصور الطبية والأعراض لتقديم تشخيص مبدئي دقيق. ستساعد المنصة الأطباء في اتخاذ قرارات أسرع وأكثر دقة، خاصة في المناطق النائية.',
      category: 'الصحة',
      status: 'qaid_almurajaa',
      stage: 'taqyeem_alaqran',
      ownerId: 2,
      score: 25
    },
    {
      title: 'نظام إدارة النفايات الذكي',
      summary: 'حلول ذكية لمراقبة وإدارة النفايات في المدن باستخدام أجهزة الاستشعار والتحليلات',
      details: 'نظام متكامل يستخدم أجهزة الاستشعار IoT لمراقبة مستوى النفايات في الحاويات، وتحسين مسارات جمع النفايات، وتقليل التكاليف البيئية. يشمل النظام تطبيقاً للمواطنين للإبلاغ عن المشاكل.',
      category: 'البيئة',
      status: 'qaid_almurajaa',
      stage: 'taqyeem_alaqran',
      ownerId: 3,
      score: 20
    },

    // Stage: murajaat_allajana (مراجعة اللجنة - committee_review)
    {
      title: 'مشروع المدينة الذكية المتكاملة',
      summary: 'تحويل المدينة إلى مدينة ذكية بالكامل مع أنظمة النقل والطاقة والأمان المتصلة',
      details: 'مشروع طموح يهدف إلى تحويل المدينة إلى نموذج للمدن الذكية عالمياً. يشمل أنظمة النقل الذكي، شبكات الطاقة المتجددة، أنظمة الأمان المتقدمة، والخدمات الحكومية الرقمية. سيتم تنفيذه على مراحل متعددة.',
      category: 'التطوير الحضري',
      status: 'qaid_almurajaa',
      stage: 'murajaat_allajana',
      ownerId: 2,
      score: 35
    },
    {
      title: 'منصة التجارة الإلكترونية الوطنية',
      summary: 'إنشاء منصة تجارة إلكترونية وطنية لدعم المنتجات والخدمات المحلية',
      details: 'تطوير منصة تجارة إلكترونية شاملة تدعم التجار والحرفيين المحليين في عرض وبيع منتجاتهم. تشمل المنصة أنظمة الدفع الآمنة، الشحن، وخدمة العملاء. الهدف هو تعزيز الاقتصاد المحلي ودعم ريادة الأعمال.',
      category: 'الاقتصاد',
      status: 'muwafaq_alayha',
      stage: 'murajaat_allajana',
      ownerId: 3,
      score: 30
    },

    // Stage: dirasat_aljadwa (دراسة الجدوى - feasibility)
    {
      title: 'مركز الابتكار والذكاء الاصطناعي',
      summary: 'إنشاء مركز متخصص في البحث والتطوير في مجال الذكاء الاصطناعي والتقنيات الناشئة',
      details: 'مركز بحثي متقدم يهدف إلى تطوير حلول الذكاء الاصطناعي للقطاعات الحكومية والخاصة. يشمل المركز مختبرات متطورة، برامج تدريبية، وشراكات مع الجامعات العالمية. سيكون المركز حاضنة للشركات الناشئة في مجال التكنولوجيا.',
      category: 'البحث والتطوير',
      status: 'muwafaq_alayha',
      stage: 'dirasat_aljadwa',
      ownerId: 2,
      score: 40
    },
    {
      title: 'برنامج الطاقة المتجددة للمباني الحكومية',
      summary: 'مشروع لتحويل جميع المباني الحكومية للاعتماد على الطاقة المتجددة',
      details: 'برنامج شامل لتركيب أنظمة الطاقة الشمسية وطاقة الرياح في جميع المباني الحكومية. يهدف المشروع إلى تقليل الاستهلاك من الطاقة التقليدية بنسبة 80% وتوفير ملايين الدولارات سنوياً، بالإضافة إلى المساهمة في حماية البيئة.',
      category: 'الطاقة',
      status: 'muwafaq_alayha',
      stage: 'dirasat_aljadwa',
      ownerId: 3,
      score: 38
    },

    // Stage: almuwafaqa (الموافقة - approval)
    {
      title: 'مشروع القطار السريع الوطني',
      summary: 'إنشاء شبكة قطارات سريعة تربط بين المدن الرئيسية لتحسين النقل العام',
      details: 'مشروع استراتيجي ضخم لإنشاء شبكة قطارات عالية السرعة تربط بين جميع المدن الرئيسية في البلاد. سيقلل المشروع من أوقات السفر بنسبة 70% ويوفر بديلاً بيئياً مستداماً للنقل الجوي والبري. يتوقع أن يخدم المشروع مليوني مسافر سنوياً.',
      category: 'النقل',
      status: 'muwafaq_alayha',
      stage: 'almuwafaqa',
      ownerId: 2,
      score: 45
    },

    // Stage: altasleem (التسليم - handoff)
    {
      title: 'نظام الهوية الرقمية الموحد',
      summary: 'تطوير نظام هوية رقمية موحد وآمن لجميع المواطنين والمقيمين',
      details: 'نظام متطور للهوية الرقمية يستخدم تقنيات البلوك تشين والتشفير المتقدم لضمان الأمان. يسمح النظام للمواطنين بالوصول لجميع الخدمات الحكومية والخاصة من خلال هوية رقمية واحدة آمنة ومحمية.',
      category: 'الأمن السيبراني',
      status: 'qaid_altanfeedh',
      stage: 'altasleem',
      ownerId: 3,
      score: 50
    },

    // Stage: altanfeedh (التنفيذ - execution)
    {
      title: 'مشروع الجامعة الرقمية',
      summary: 'إنشاء أول جامعة رقمية متكاملة تقدم تعليماً عالي الجودة عبر الإنترنت',
      details: 'جامعة رقمية رائدة تقدم برامج أكاديمية معتمدة بالكامل عبر الإنترنت. تستخدم أحدث تقنيات الواقع الافتراضي والذكاء الاصطناعي لتقديم تجربة تعليمية متميزة. الجامعة مخصصة للطلاب الذين لا يستطيعون حضور الجامعات التقليدية.',
      category: 'التعليم العالي',
      status: 'qaid_altanfeedh',
      stage: 'altanfeedh',
      ownerId: 2,
      score: 55
    },
    {
      title: 'مستشفى المستقبل الذكي',
      summary: 'بناء مستشفى متطور يعتمد كلياً على التكنولوجيا والذكاء الاصطناعي',
      details: 'مستشفى متكامل يستخدم أحدث التقنيات الطبية والذكاء الاصطناعي في جميع العمليات. يشمل روبوتات جراحية، أنظمة تشخيص ذكية، وغرف عمليات مؤتمتة بالكامل. المستشفى سيكون نموذجاً للرعاية الصحية في المستقبل.',
      category: 'الصحة',
      status: 'qaid_altanfeedh',
      stage: 'altanfeedh',
      ownerId: 3,
      score: 60
    },

    // Additional ideas with different statuses
    {
      title: 'تطبيق الذكاء الاصطناعي للزراعة',
      summary: 'استخدام الذكاء الاصطناعي لتحسين الإنتاج الزراعي ومراقبة المحاصيل',
      details: 'تطوير نظام ذكي يستخدم الصور الجوية والاستشعار عن بعد لمراقبة حالة المحاصيل وتقديم توصيات للمزارعين حول الري والتسميد ومكافحة الآفات.',
      category: 'الزراعة',
      status: 'maswada',
      stage: 'muqadama',
      ownerId: 2,
      score: 5
    },
    {
      title: 'مشروع المكتبة الرقمية الوطنية',
      summary: 'رقمنة التراث والكتب والمخطوطات وإتاحتها للجمهور',
      details: 'مشروع ثقافي ضخم لرقمنة جميع الكتب والمخطوطات التراثية وإتاحتها للباحثين والطلاب عبر منصة رقمية متطورة مع أدوات البحث والتصفح.',
      category: 'الثقافة',
      status: 'marfuda',
      stage: 'taqyeem_alaqran',
      ownerId: 3,
      score: 18
    },
    {
      title: 'نظام التعليم التفاعلي للأطفال',
      summary: 'تطوير منصة تعليمية تفاعلية مخصصة للأطفال باستخدام الألعاب التعليمية',
      details: 'منصة تعليمية مبتكرة تجمع بين الألعاب والتعلم لجعل التعليم أكثر متعة وفعالية للأطفال. تشمل المنصة محتوى تفاعلي في الرياضيات، العلوم، واللغة العربية.',
      category: 'التعليم',
      status: 'qaid_almurajaa',
      stage: 'murajaat_allajana',
      ownerId: 2,
      score: 28
    },
    {
      title: 'مشروع السياحة الإلكترونية',
      summary: 'إنشاء منصة شاملة لتعزيز السياحة المحلية وجذب السياح',
      details: 'منصة رقمية متكاملة تعرض المعالم السياحية، الفنادق، المطاعم، والأنشطة الترفيهية. تشمل خدمات الحجز، الدليل السياحي الافتراضي، والجولات الافتراضية.',
      category: 'السياحة',
      status: 'muwafaq_alayha',
      stage: 'dirasat_aljadwa',
      ownerId: 3,
      score: 33
    }
  ];

  // Clear existing data first (optional - be careful in production!)
  console.log('🧹 Cleaning existing dummy data...');
  await prisma.vote.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.idea.deleteMany({
    where: {
      title: {
        in: ideasData.map(idea => idea.title)
      }
    }
  });

  // Create ideas with votes and comments
  for (const ideaData of ideasData) {
    console.log(`Creating idea: ${ideaData.title}`);
    
    const idea = await prisma.idea.create({
      data: {
        title: ideaData.title,
        summary: ideaData.summary,
        details: ideaData.details,
        category: ideaData.category,
        status: ideaData.status as any,
        stage: ideaData.stage as any,
        ownerId: ideaData.ownerId,
        score: ideaData.score,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      },
    });

    // Add some votes to each idea
    const voteCount = Math.floor(Math.random() * 20) + 5; // 5-24 votes per idea
    const voters = [2, 3]; // Available user IDs
    
    for (let i = 0; i < voteCount; i++) {
      const voterId = voters[Math.floor(Math.random() * voters.length)];
      try {
        await prisma.vote.create({
          data: {
            ideaId: idea.id,
            voterId: voterId,
            createdAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000), // Random date
          },
        });
      } catch (error) {
        // Skip if vote already exists (unique constraint)
      }
    }

    // Add some comments
    const commentTexts = [
      'فكرة ممتازة ومبتكرة، أؤيد تطبيقها',
      'أعتقد أن هذا المشروع سيكون له تأثير إيجابي كبير',
      'يحتاج إلى دراسة أكثر تفصيلاً للجوانب التقنية',
      'مشروع طموح ويستحق الدعم والتمويل',
      'هناك تحديات في التنفيذ لكن الفكرة قيمة',
      'يمكن البدء بنسخة تجريبية أولاً',
      'أقترح إشراك الخبراء المتخصصين في هذا المجال',
      'الفكرة واعدة وتتماشى مع رؤية التحول الرقمي',
    ];

    const commentCount = Math.floor(Math.random() * 5) + 1; // 1-5 comments per idea
    
    for (let i = 0; i < commentCount; i++) {
      const commentAuthorId = voters[Math.floor(Math.random() * voters.length)];
      const commentText = commentTexts[Math.floor(Math.random() * commentTexts.length)];
      
      await prisma.comment.create({
        data: {
          ideaId: idea.id,
          authorId: commentAuthorId,
          content: commentText,
          isAnonymous: Math.random() > 0.7, // 30% chance of anonymous comment
          createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000), // Random date
        },
      });
    }
  }

  console.log('✅ Successfully seeded database with dummy ideas!');
  console.log(`📊 Created ${ideasData.length} ideas across all stages`);
  console.log('🗳️ Added random votes and comments to each idea');
  
  // Log stage distribution
  const stageCounts = ideasData.reduce((acc, idea) => {
    acc[idea.stage] = (acc[idea.stage] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📈 Ideas distribution by stage:');
  Object.entries(stageCounts).forEach(([stage, count]) => {
    console.log(`   ${stage}: ${count} ideas`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });