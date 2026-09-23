# Internal Ticketing System - Frontend Client

A production-ready React single-page application (SPA) frontend for the Internal Ticketing System. This application enables client organizations and internal administrators to report, manage, transition, verify, and track software defects and feature requests.

---

## 1. Project Overview

This repository contains the complete frontend client for the Internal Ticketing System. It provides a user interface for managing issues, projects, system modules, user accounts, issue verification queues, interactive Kanban boards, comments, file attachments, and audit trail logs.

---

## 2. Tech Stack

The technologies used in this repository are:

- **Core Library**: React 18 (`react`, `react-dom`)
- **Build Tool**: Vite 6 (`vite`, `@vitejs/plugin-react`)
- **Routing**: React Router v7 (`react-router-dom`)
- **Server State Management**: TanStack Query v5 (`@tanstack/react-query`)
- **Form Management**: React Hook Form (`react-hook-form`)
- **HTTP Client**: Axios (`axios`)
- **Styling**: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`)

---

## 3. Prerequisites

- **Node.js**: Recommended v18.x or higher
- **npm**: Recommended v9.x or higher

---

## 4. Environment Variables

Environment variables are configured in `.env` (derived from `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

- `VITE_API_BASE_URL`: Base URL pointing to the Spring Boot REST backend API.

---

## 5. Installation

Install project dependencies using npm:

```bash
npm install
```

---

## 6. Development

To start the Vite local development server:

```bash
npm run dev
```

---

## 7. Production Build

To compile and bundle the application for production:

```bash
npm run build
```

To preview the built production bundle locally:

```bash
npm run preview
```

---

## 8. Application Routes

The application defines the following protected and public routes:

- `/login` - Public authentication page
- `/dashboard` / `/` - Main application dashboard
- `/issues` - Paginated issue management table view
- `/issues/kanban` - 7-column interactive Issue Kanban Board
- `/issues/new` - Create issue form
- `/issues/:id` - Issue details, comments, attachments & activity audit view
- `/issues/:id/edit` - Edit issue details form
- `/projects` - Project management list
- `/projects/new` - Create project form
- `/projects/:id` - Project details view
- `/projects/:id/edit` - Edit project details form
- `/modules` - System module management list
- `/modules/new` - Create system module form
- `/modules/:id/edit` - Edit system module form
- `/users` - User account management list
- `/users/new` - Create user account form
- `/users/:id` - User profile details view
- `/users/:id/edit` - Edit user account form
- `/verification` - Client & admin issue verification queue

---

## 9. Implemented Features

- **JWT Authentication & Session Restoration**: Secure login flow, token persistence in `localStorage`, session restoration on application launch, and automatic token invalidation on 401 response.
- **Role-Aware UI**: Conditional UI element rendering based on authenticated user context.
- **Issue Management**: Full CRUD capabilities, multi-field filtering (search, project, stage, priority, type), pagination, and issue detail inspection.
- **Issue Stage Transitions**: State transition controls validating stage lifecycle changes against backend state-machine rules.
- **Kanban Board**: 7-stage workflow board (`SUBMITTED`, `RECEIVED`, `UNDER_DEVELOPMENT`, `TESTING`, `DEPLOYED`, `DECLINED`, `RESOLVED`) supporting native HTML5 drag-and-drop and dropdown stage selectors.
- **Project Management**: Project creation, editing, list view, and details inspection.
- **Module Management**: System module creation, editing, list view, and project association.
- **User Management**: User account listing, multi-role filter, create, edit, and active/inactive status toggling.
- **Verification Queue**: Dedicated queue for `APP_ADMIN` and `CLIENT_ADMIN` to verify or reject resolved defect reports.
- **Comments**: Chronological issue comment feed supporting comment posting, inline editing, and deletion.
- **Attachments**: File attachment management supporting upload (`FormData`), pre-signed URL downloading, file size validation (max 10 MB), and MIME type / extension checks.
- **Audit Timeline**: Detailed issue activity and audit trail history tracking action events, actors, timestamps, and field value diffs.

---

## 10. Authorization

Frontend UI controls (such as action buttons and form options) are conditionally rendered for user experience only. The Spring Boot backend serves as the sole authoritative security and permission layer.

Supported application roles:
- `APP_ADMIN`: Internal superuser with system-wide access.
- `CLIENT_ADMIN`: Administrator for a specific client organization.
- `CLIENT_USER`: Standard member of a client organization.

---

## 11. API Integration

All HTTP communications use a centralized Axios client (`src/api/client.js`). Outgoing requests automatically include the `Authorization: Bearer <token>` header, and response errors (such as 401 Unauthorized or 403 Forbidden) are parsed and surfaced through standardized error banners.

---

## 12. Project Structure

```text
src/
├── api/          # Axios client instance, request/response interceptors, and API services
├── components/   # Reusable UI primitives (Button, Card, Input, LoadingSpinner, ErrorMessage)
├── context/      # React context providers (AuthContext)
├── hooks/        # Custom React hooks (useAuth)
├── layouts/      # Application shell layouts (RootLayout, AppLayout)
├── lib/          # Client setup configuration (queryClient)
├── pages/        # Application page components
├── routes/       # Router definition and route guards (ProtectedRoute, PublicRoute)
├── services/     # Auxiliary service modules
└── utils/        # Token storage and helper functions
```

---

## 13. Build Verification

The production bundle builds cleanly with zero errors:

- **Command**: `npm run build`
- **Output**: 184 modules transformed (`dist/index.html`, `dist/assets/index-CWy0DkRU.css`, `dist/assets/index-DWITVWnR.js`).
