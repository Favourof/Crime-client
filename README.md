# Crime Evidence Client

Next.js App Router frontend for the Crime Evidence platform. This UI connects to the backend API for authentication, case management, evidence handling, and AI-assisted analysis workflows.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui-style component primitives
- Axios with API instance + interceptors

## Features

- Auth flow:
  - login/logout
  - token-based session handling
  - admin user management screens
- Dashboard UX:
  - fixed sidebar and top navigation
  - recent activity/overview cards
- Cases:
  - paginated case listing
  - status + crime type filtering
  - create case modal
  - case actions modal (update + status progression)
  - admin assignment modal with investigator search
  - case timeline (audit events)
- Evidence:
  - add/update/delete evidence
  - structured evidence templates (violent + cyber/fraud)
  - custody timeline display
  - inline file preview with `Preview File` toggle (image/video/PDF)
- Analysis:
  - run analysis
  - preview generated prompt
  - save manual/external analysis JSON
  - analysis history by case

## Folder Structure

```txt
client/
  src/
    app/
      (auth)/
      (dashboard)/
    components/
    hooks/
    lib/
    types/
```

## Environment

Create `client/.env`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Notes:
- The client API utility appends `/api` automatically if missing.
- For local full stack, backend default runs on port `4000`.

## Run Locally

```bash
cd client
npm install
npm run dev
```

App URL: `http://localhost:3000`

## Build

```bash
npm run build
npm run start
```

## Quality Check

```bash
npm exec -- tsc --noEmit
```

## Integration Notes

- The frontend expects backend role-based responses (`admin`, `investigator`).
- Case, evidence, and analysis views are wired to the current backend endpoints under `/api`.
- Auth uses bearer token from local storage via Axios interceptors in `src/lib/api.ts`.
