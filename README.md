# منصّة فِكْر لإدارة الأفكار

هذا المستودع يحتوي على تطبيق ويب متكامل لإدارة الأفكار داخل مؤسّسة حكومية أو كبرى. تم تصميمه اعتمادًا على **Next.js** للواجهة الأمامية و **NestJS** للواجهة الخلفية، مع قاعدة بيانات **PostgreSQL** مهيّأة عبر **Prisma ORM**. التطبيق يدعم اللغة العربية بالكامل (RTL)، ويمكن توسيعه بسهولة لإضافة لغات أخرى.

## الميزات الرئيسية

* **🔐 نظام مصادقة متكامل**: تسجيل دخول وإنشاء حسابات جديدة مع JWT tokens
* **👤 إدارة المستخدمين**: ملفات شخصية شاملة مع إمكانية تعديل المعلومات والصور الشخصية
* **🖼️ الصور الشخصية**: رفع وإدارة الصور الشخصية للمستخدمين
* **🔑 تغيير كلمات المرور**: نظام آمن لتغيير كلمات المرور مع التحقق
* **🎯 إدارة الأفكار**: نظام شامل لإضافة وإدارة ومتابعة الأفكار
* **📊 إدارة المراحل**: نظام متقدم لإدارة مراحل تقدم الأفكار مع واجهات بصرية
* **🔄 انتقال المراحل**: نظام مرن لانتقال الأفكار بين المراحل المختلفة
* **👨‍💼 لوحة الإدارة**: واجهات إدارية شاملة للمدراء لإدارة المستخدمين والمراحل
* **📈 الإحصائيات والتقارير**: عرض إحصائيات مفصلة للأفكار والمستخدمين
* **🌐 دعم كامل للعربية RTL**: تصميم محسّن للغة العربية مع دعم الاتجاه من اليمين لليسار

## المتطلبات العامة

* **الواجهة الأمامية**: React/Next.js مع TypeScript، Tailwind CSS، shadcn/ui.
* **الواجهة الخلفية**: NestJS مع REST API وWebSocket للأحداث الحية.
* **قاعدة البيانات**: PostgreSQL مع Prisma. ملف المخطط موجود في `apps/backend/prisma/schema.prisma` ويحتوي على جميع الجداول والعلاقات المطلوبة، كما هو موضّح في الوثائق【985668824657452†L176-L188】.
* **نظام صلاحيات ديناميكي (RBAC)**: تم تعريف جداول `Role` و`Permission` و`RolePermission` بعلاقات عديدة-لعديد مع مفتاح مركّب لتجنّب تكرار الأدوار والصلاحيات【985668824657452†L176-L188】.
* **Docker**: يمكنك تشغيل كل الخدمات بواسطة `docker compose` محليًا، أو بناء صور منفصلة للنشر في بيئة إنتاج.

## الهيكلية

```
fikr/
├── README.md                # هذا الملف
├── docker-compose.yml       # تعريف الخدمات: Postgres، backend، frontend
├── package.json             # يعرّف workspaces لتشغيل الواجهة والخلفية
├── apps/
│   ├── backend/             # تطبيق NestJS
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── prisma/
│   │       │   ├── prisma.module.ts
│   │       │   └── prisma.service.ts
│   │       ├── users/
│   │       │   ├── users.module.ts
│   │       │   ├── users.controller.ts
│   │       │   ├── users.service.ts
│   │       │   └── dto/
│   │       │       ├── create-user.dto.ts
│   │       │       ├── update-profile.dto.ts
│   │       │       └── change-password.dto.ts
│   │       ├── roles/
│   │       │   ├── roles.module.ts
│   │       │   ├── roles.controller.ts
│   │       │   └── roles.service.ts
│   │       ├── stages/
│   │       │   ├── stages.module.ts
│   │       │   ├── stages.controller.ts
│   │       │   ├── stages.service.ts
│   │       │   └── dto/
│   │       │       ├── update-idea-stage.dto.ts
│   │       │       └── bulk-update.dto.ts
│   │       ├── auth/
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   └── jwt.strategy.ts
│   │       └── ideas/
│   │           ├── ideas.module.ts
│   │           ├── ideas.controller.ts
│   │           ├── ideas.service.ts
│   │           └── dto/
│   │               ├── create-idea.dto.ts
│   │               └── create-comment.dto.ts
│   └── web/                 # تطبيق Next.js
│       ├── Dockerfile
│       ├── package.json
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── public/
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx
│           │   ├── globals.css
│           │   ├── admin/
│           │   │   ├── stages/
│           │   │   │   └── page.tsx
│           │   │   └── users/
│           │   │       └── page.tsx
│           │   ├── ideas/
│           │   │   ├── page.tsx
│           │   │   ├── [id]/
│           │   │   │   └── page.tsx
│           │   │   └── new/
│           │   │       └── page.tsx
│           │   ├── login/
│           │   │   └── page.tsx
│           │   ├── profile/
│           │   │   └── page.tsx
│           │   └── register/
│           │       └── page.tsx
│           ├── components/
│           │   ├── Header.tsx
│           │   ├── IdeaCard.tsx
│           │   ├── ProfileSettings.tsx
│           │   └── ProtectedRoute.tsx
│           ├── contexts/
│           │   └── AuthContext.tsx
│           └── lib/
│               └── api.ts

```

## تشغيل المشروع محليًا

1. **ثبت المتطلبات**: تأكد من وجود [Docker](https://docs.docker.com/get-docker/) و [Node.js](https://nodejs.org) على جهازك.
2. **البيئة**: أنشئ ملف `.env` في جذر `apps/backend` يحوي متغيرات الاتصال بقاعدة البيانات وإعدادات JWT. يمكنك استخدام `.env.example` كمرجع. على سبيل المثال:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/fikr
   JWT_SECRET=changeme
   JWT_EXPIRATION=3600s
   ```
3. **تشغيل الخدمات**: من جذر المشروع (`fikr/`) نفّذ:
   ```sh
   docker compose up -d
   ```
   يقوم هذا الأمر ببناء الحاويات وتشغيل قاعدة البيانات والواجهة الخلفية والواجهة الأمامية تلقائيًا.
4. **تهجير قاعدة البيانات**: بعد تشغيل الخدمات، استخدم Prisma لتطبيق المهاجرات وإعداد الأدوار الأساسية:

   ```sh
   docker compose exec backend npx prisma migrate deploy
   ```

   **إعداد الأدوار الأساسية**: يجب إنشاء الأدوار الأساسية في قاعدة البيانات:

   ```sh
   docker compose exec postgres psql -U postgres -d fikr -c "INSERT INTO \"Role\" (name, description) VALUES ('admin', 'مدير النظام'), ('user', 'مستخدم عادي');"
   ```

5. **التطوير المحلي بدون Docker**: يمكنك تشغيل الواجهة والخلفية مباشرة باستخدام npm:
   ```sh
   # في جذر المشروع
   npm install
   npm run dev
   ```
   يقوم السكربت `dev` بتشغيل الواجهة في `apps/web` على http://localhost:3000 والواجهة الخلفية في `apps/backend` على http://localhost:4000.

## الحسابات التجريبية

بعد إعداد قاعدة البيانات والأدوار، يمكنك استخدام الحسابات التالية للاختبار:

* **حساب المدير**: `admin@fikr.com` (لا يتطلب كلمة مرور)
* **حساب المستخدم**: `test@example.com` (لا يتطلب كلمة مرور)

يمكنك أيضًا إنشاء حسابات جديدة من خلال صفحة التسجيل في التطبيق.

## الوظائف المتاحة

### للمستخدمين العاديين:
* **إدارة الملف الشخصي**: تعديل المعلومات الشخصية ورفع الصور الشخصية
* **تغيير كلمة المرور**: نظام آمن لتغيير كلمة المرور
* **إدارة الأفكار**: إضافة وتعديل ومتابعة الأفكار الشخصية
* **عرض الإحصائيات**: مراجعة إحصائيات الأفكار والتفاعلات

### للمدراء:
* **إدارة المستخدمين**: عرض وإدارة جميع حسابات المستخدمين
* **إدارة المراحل**: التحكم في مراحل تقدم الأفكار والانتقالات بينها
* **الإحصائيات العامة**: عرض إحصائيات شاملة للنظام
* **إدارة الأدوار**: التحكم في أدوار المستخدمين وصلاحياتهم

## ملاحظات الأمن والأداء

* تم تأمين جميع كلمات المرور باستخدام خوارزمية **Bcrypt** والتعامل مع Tokens عبر JWT.
* تم استخدام قيود **Prisma** لتعريف المفاتيح المركبة والفهارس لمنع التكرار في جداول العديد-لعديد【985668824657452†L176-L188】.
* يمكن تفعيل إعدادات Rate Limiting، Helmet وCORS من خلال تعديل ملفات إعداد NestJS في `apps/backend/src/main.ts`.

## المساهمات

تم إعداد هذا المشروع لتمكين فرق التطوير من بناء منصة قابلة للتوسع بسهولة. يمكنك إضافة وحدات جديدة (Modules) في NestJS أو صفحات ومكونات جديدة في Next.js مع الحفاظ على هيكلية العمل القائمة. للمساهمة أو الإبلاغ عن مشكلة، يُرجى فتح طلب دمج أو تذكرة عبر النظام المتبّع في المؤسسة.