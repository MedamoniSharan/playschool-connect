# Little Berries & Montessori Connect

Frontend-only demo of a playschool and Montessori management system: role-based dashboards, curriculum, one-tap lesson progress (presented → practiced → mastered), lesson planning, reports, gallery, attendance, fees, notifications, and messaging.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- React Router
- Mock data and React Context (`src/context/AppContext.tsx`)

## Setup

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview   # optional local preview of production build
```

## Test users (mock)

| Role    | Email                 | Password   |
|---------|----------------------|------------|
| Admin   | admin@smartplay.com  | admin123   |
| Teacher | teacher@smartplay.com| teacher123 |
| Parent  | parent@smartplay.com | parent123  |

## Project layout (high level)

- `src/pages/` — route screens (dashboard, curriculum, progress, lessons, reports, etc.)
- `src/data/mockData.ts` — seed users, classes, curriculum, progress, lesson plans, reports
- `src/context/AppContext.tsx` — auth + shared state and mutations
- `src/components/` — layout (sidebar, navbar) and shared UI

## Features

- **Roles:** Admin, Teacher, Parent — navigation and data visibility follow role rules.
- **Progress:** Teachers/admins update Montessori stages with one click; parents see read-only bars and badges.
- **Curriculum:** Per-class subjects and activities; teachers/admins can add subjects and activities.
- **Lesson plans:** List and calendar views; assign student + activity + date.
- **Reports:** Generated summaries from progress + attendance; print-friendly (sidebar/nav hidden when printing).

There is no backend; all changes stay in memory until you refresh the page.
