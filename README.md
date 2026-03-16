# Fikr Platform for Idea Management

This repository contains a complete web application for managing ideas within a government institution or a large organization. It is built using **Next.js** for the frontend and **NestJS** for the backend, with a **PostgreSQL** database configured through **Prisma ORM**. The application fully supports Arabic (RTL) and can be easily extended to add other languages.

## Key Features

* **🔐 Integrated Authentication System**: Login and registration with JWT tokens
* **👤 User Management**: Comprehensive user profiles with the ability to edit information and profile pictures
* **🖼️ Profile Pictures**: Upload and manage user profile images
* **🔑 Password Change**: Secure password change system with verification
* **🎯 Idea Management**: A complete system for adding, managing, and tracking ideas
* **📊 Stage Management**: Advanced system for managing idea progress stages with visual interfaces
* **🔄 Stage Transitions**: Flexible system for moving ideas between different stages
* **👨‍💼 Admin Dashboard**: Comprehensive administrative interfaces for managing users and stages
* **📈 Statistics and Reports**: Detailed statistics for ideas and users
* **🌐 Full Arabic RTL Support**: Optimized design for Arabic with right-to-left layout support

## General Requirements

* **Frontend**: React/Next.js with TypeScript, Tailwind CSS, shadcn/ui.
* **Backend**: NestJS with REST API and WebSocket for live events.
* **Database**: PostgreSQL with Prisma. The schema file is located at `apps/backend/prisma/schema.prisma` and contains all required tables and relationships as described in the documentation.
* **Dynamic Role-Based Access Control (RBAC)**: Tables `Role`, `Permission`, and `RolePermission` are defined with many-to-many relationships using a composite key to avoid duplicate roles and permissions.
* **Docker**: All services can be run locally using `docker compose`, or built as separate images for deployment in production.

## Structure

```
fikr/
├── README.md                # This file
├── docker-compose.yml       # Services definition: Postgres, backend, frontend
├── package.json             # Defines workspaces for running frontend and backend
├── apps/
│   ├── backend/             # NestJS application
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
│   └── web/                 # Next.js application
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

## Running the Project Locally

1. **Install Requirements**: Ensure you have [Docker](https://docs.docker.com/get-docker/) and [Node.js](https://nodejs.org) installed on your system.

2. **Environment Setup**: Create a `.env` file in the root of `apps/backend` containing database connection variables and JWT configuration. You can use `.env.example` as a reference. For example:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/fikr
JWT_SECRET=changeme
JWT_EXPIRATION=3600s
```

3. **Start Services**: From the project root (`fikr/`) run:

```sh
docker compose up -d
```

This command builds the containers and automatically runs the database, backend, and frontend.

4. **Database Migration**: After the services start, use Prisma to apply migrations and prepare the basic roles:

```sh
docker compose exec backend npx prisma migrate deploy
```

**Create Default Roles**:

```sh
docker compose exec postgres psql -U postgres -d fikr -c "INSERT INTO \"Role\" (name, description) VALUES ('admin', 'System Administrator'), ('user', 'Regular User');"
```

5. **Local Development Without Docker**: You can run the frontend and backend directly using npm:

```sh
# From the project root
npm install
npm run dev
```

The `dev` script runs the frontend in `apps/web` on `http://localhost:3000` and the backend in `apps/backend` on `http://localhost:4000`.

## Test Accounts

After setting up the database and roles, you can use the following accounts for testing:

* **Admin Account**: `admin@fikr.com` (no password required)
* **User Account**: `test@example.com` (no password required)

You can also create new accounts through the registration page in the application.

## Available Functions

### For Regular Users

* **Profile Management**: Edit personal information and upload profile images
* **Password Change**: Secure password change system
* **Idea Management**: Add, edit, and track personal ideas
* **Statistics View**: Review idea statistics and interactions

### For Administrators

* **User Management**: View and manage all user accounts
* **Stage Management**: Control idea progress stages and transitions
* **General Statistics**: View comprehensive system statistics
* **Role Management**: Manage user roles and permissions

## Security and Performance Notes

* All passwords are secured using the **Bcrypt** algorithm and tokens are handled using **JWT**.
* **Prisma constraints** are used to define composite keys and indexes to prevent duplication in many-to-many tables.
* Rate Limiting, Helmet, and CORS settings can be enabled by modifying the NestJS configuration in `apps/backend/src/main.ts`.

## Contributions

This project was prepared to enable development teams to build an easily scalable platform. New modules can be added in NestJS or new pages and components can be added in Next.js while maintaining the existing architecture. To contribute or report an issue, open a merge request or create a ticket through the organization’s issue tracking system.
