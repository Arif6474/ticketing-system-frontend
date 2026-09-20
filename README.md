# Internal Ticketing System - Frontend Client

React 18 Single-Page Application for the Internal Ticketing System.

---

## 1. Frontend Overview

The frontend client provides a fast, responsive user interface for the Internal Ticketing System. Built with React 18, Vite, React Router v7, TanStack Query v5, and Tailwind CSS v4, it handles client-side routing, state management, and real-time backend health polling.

---

## 2. Technology Stack & Specifications

- **Library**: React 18+
- **Language Constraint**: JavaScript / JSX (**No TypeScript**)
- **Build Tool**: Vite 6+
- **Client Routing**: React Router v7 (`react-router-dom`)
- **Server State & Querying**: TanStack Query v5 (`@tanstack/react-query`)
- **Form Handling**: React Hook Form (`react-hook-form`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **HTTP Client**: Native Browser `fetch` API (**No Axios**)

---

## 3. Frontend Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable shared UI components
│   ├── features/         # Feature-specific modules (future implementation)
│   ├── hooks/            # Custom React hooks (e.g., useHealthCheck.js)
│   ├── layouts/          # Layout shell components (e.g., RootLayout.jsx)
│   ├── lib/              # Client utilities & setup (e.g., queryClient.js)
│   ├── pages/            # Application pages (e.g., HomePage.jsx)
│   ├── routes/           # React Router route definitions (e.g., routes/index.jsx)
│   ├── services/         # API Service functions (e.g., healthService.js)
│   ├── App.jsx           # Root application component wrapper
│   ├── index.css         # Tailwind directives & global styling
│   └── main.jsx          # React DOM mounting entry point
├── index.html            # Vite HTML template
├── package.json          # Node dependencies & npm scripts
├── vite.config.js        # Vite bundler configuration
└── README.md             # Frontend documentation
```

---

## 4. API Configuration

The frontend reads backend API base URLs from Vite environment variables:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

- Local default: `http://localhost:8080/api`
- Configurable via `.env` or `VITE_API_BASE_URL`

---

## 5. Health Check Integration

The foundation includes a health check integration polling the backend `GET /api/health` endpoint:
- **Service Layer** (`src/services/healthService.js`): Uses the browser's native `fetch` API to request JSON health status.
- **Custom Hook** (`src/hooks/useHealthCheck.js`): Uses TanStack Query `useQuery` with auto-refetching interval.
- **UI Indicator** (`src/pages/HomePage.jsx`): Displays real-time HTTP 200 connection status badges.

---

## 6. How to Run Frontend

Navigate to `frontend/` and execute:

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 7. How to Create a Production Build

To test and compile the production bundle:

```bash
npm run build
```

This compiles static assets into the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 8. Frontend Architecture Conventions

1. **Strict JavaScript/JSX**: All files must use `.jsx` for React components and `.js` for non-UI utilities. TypeScript is disallowed per project rules.
2. **Feature-Based Scalability**: Code is organized into feature-based subdirectories (`components/`, `layouts/`, `pages/`, `features/`, `hooks/`, `lib/`, `services/`, `routes/`).
3. **Native API Client**: Use native `fetch` for HTTP interactions; avoid adding external HTTP client bloat until auth middleware/interceptors require it.
4. **Tailwind Styling**: All styling uses utility-first Tailwind CSS v4 design tokens.

---

## 9. Implementation Status & Deferred Features

The frontend currently implements **ONLY** the foundation layout and backend connection health check widget.

The following features are **NOT** implemented yet:
- Authentication & Login / Register flows
- User Management & User Profile screens
- RBAC UI guards & permissions
- Project & Organization dashboards
- Issue creation, editing, and listing
- Drag-and-Drop Kanban Board (`dnd-kit` will be added when Kanban is built)
- Attachment uploads & Cloudflare R2 integration
- Comments and Audit Trail components
