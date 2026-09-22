# Internal Ticketing System - Frontend Client

React 18 Single-Page Application foundation for the Internal Ticketing System.

---

## 1. Overview

This directory contains the production-ready frontend architecture built with React 18, Vite, React Router v7, TanStack Query v5, React Hook Form, and Tailwind CSS v4.

---

## 2. Technology Stack & Specifications

- **Library**: React 18+
- **Language**: JavaScript / JSX (**No TypeScript**)
- **Build Tool**: Vite 6+
- **Routing**: React Router v7 (`react-router-dom`)
- **Server State Management**: TanStack Query v5 (`@tanstack/react-query`)
- **Form Handling**: React Hook Form (`react-hook-form`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **HTTP Client**: Axios with Bearer token interceptor and standardized error parsing

---

## 3. Project Structure

```text
src/
├── api/          # Axios API client setup and interceptors
├── components/   # Reusable UI components (Button, Input, Card, LoadingSpinner, ErrorMessage, Sidebar, Header)
├── hooks/        # Custom React hooks (useAuth, useHealthCheck)
├── layouts/      # App layout shells (RootLayout, AppLayout)
├── lib/          # Global client setup (queryClient)
├── pages/        # Application pages (DashboardPage, LoginPage, NotFoundPage)
├── routes/       # Router setup and guards (ProtectedRoute, PublicRoute, router)
├── utils/        # Utility helpers (auth token storage, parseApiError)
├── App.jsx       # App provider wrapper
├── index.css     # Tailwind directives & global styling
└── main.jsx      # React DOM entry point
```

---

## 4. API & Environment Setup

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Configure `VITE_API_BASE_URL` if different from default:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 5. Development & Build

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run production build
npm run build

# Preview production build
npm run preview
```

---

## 6. Architecture Highlights

1. **API Client**: Axios instance configured with automatic `Authorization: Bearer <token>` request interceptor and response error parsing.
2. **Token Storage**: `src/utils/auth.js` helper managing localStorage token persistence.
3. **Route Guards**: `ProtectedRoute` and `PublicRoute` wrappers ensuring secure navigation.
4. **App Layout**: Clean layout shell featuring a fixed `Sidebar` and sticky `Header`.
5. **UI Kit**: Lightweight reusable `Button`, `Input`, `Card`, `LoadingSpinner`, and `ErrorMessage` components.
