# BookVault Architecture

BookVault is organized as a full stack TypeScript monorepo with two deployable applications and room for shared packages later.

## Root

- `mobile/`: Expo SDK 54 app for iOS, Android, and Web. It is mobile-first and styled with NativeWind.
- `backend/`: Node.js API using Express, Prisma, PostgreSQL, and JWT configuration.
- `prisma/`: Prisma schema and future migrations. The datasource is PostgreSQL and reads `DATABASE_URL`.
- `packages/`: Reserved for shared contracts, schemas, or utilities when the mobile app and API need common types.
- `assets/`: Expo image assets shared by the mobile app configuration.
- `docs/`: Project documentation, including this architecture note.
- `scripts/`: Reserved for automation such as database setup, code generation, or release tasks.
- `generated/`: Generated Prisma client output. This folder is ignored by Git and recreated with `npm run prisma:generate`.

## Mobile

- `mobile/src/app/`: Expo Router routes and layouts.
- `mobile/src/assets/`: Mobile-only assets.
- `mobile/src/components/`: Reusable UI and layout components.
- `mobile/src/config/`: Runtime configuration such as `EXPO_PUBLIC_API_URL`.
- `mobile/src/constants/`: Static domain constants that are not user data.
- `mobile/src/features/`: Future feature modules, grouped by domain such as auth and books.
- `mobile/src/hooks/`: Reusable React hooks.
- `mobile/src/routes/`: Route path constants when navigation grows.
- `mobile/src/screens/`: Screen-level compositions when a route delegates rendering.
- `mobile/src/services/`: API client and external service adapters.
- `mobile/src/shared/`: Cross-feature helpers, styles, types, and libraries.
- `mobile/src/styles/`: NativeWind global CSS entry.
- `mobile/src/types/`: App-wide TypeScript types.
- `mobile/src/utils/`: Small framework-agnostic utilities.

## Backend

- `backend/src/config/`: Environment and JWT configuration.
- `backend/src/database/`: Prisma client setup.
- `backend/src/http/controllers/`: Future request controllers.
- `backend/src/http/middlewares/`: Express middlewares such as error handling and future auth validation.
- `backend/src/http/routes/`: Express route composition.
- `backend/src/modules/`: Future domain modules, such as auth and books, with services and repositories.
- `backend/src/shared/`: Shared backend errors, types, and utilities.
- `backend/src/validations/`: Future request validation schemas.
- `backend/src/app.ts`: Express application setup.
- `backend/src/server.ts`: API process bootstrap.

## Data Rule

No mocked user data or fixed arrays should be used to represent application records. User and book records must come from PostgreSQL through the Express API.
