## Deployment
- After code changes, run `vercel --prod` once and move on
- Do NOT poll deployment status or wait for Vercel to finish
- Do NOT cancel or retry deployments
- Do NOT run `vercel inspect` or check deployment status

## Tech Stack
- React + Vite + TypeScript + Tailwind CSS v4
- Two Supabase clients: auth (iauulqfgrbegwcnfatmx) and data (xdiqvvctdwbexfyoqrzh)
- Deployed on Vercel at board.njd-services.net
- Shared navbar web component loaded from njd-services.net/njd-navbar.js
- RTL-first (Arabic primary), bilingual AR/EN

## Important
- All data tables (projects, sprints, tasks, design_items, comments) are on the data project
- Auth (login, session, roles, profiles, user_roles, app_access) is on the auth project
- Use `supabaseData` for data operations, `supabase` for auth operations
- Both clients are exported from `src/lib/supabase.ts`

## RBAC
- Roles: `super_admin` and `employee`
- Role fetched via `supabase.rpc('get_user_role')` on init
- App access checked via `supabase.rpc('has_app_access')` on init
- `useIsAdmin()` hook for admin checks throughout the app
- Admin-only: Team page, Import page, project creation/deletion, FAB on dashboard

## Theme
- Dark mode variant: `@variant dark (&:where(.dark, .dark *))` in index.css
- Theme synced via cookies (`njd-theme`) across subdomains
- Navbar fires `njd-theme-change` event, Board listens via `setTheme()`

## Git
- Always commit after each successful change with a descriptive message
- Use: git add -A && git commit -m "description of change"
- Commit BEFORE deploying to Vercel
- Never leave working changes uncommitted

## TypeScript
- Type check: `npx tsc -p tsconfig.app.json --noEmit`
- Run from project root `/Volumes/PortableSSD/NJD-Board`
