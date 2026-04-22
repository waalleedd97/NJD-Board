## Deployment
- After code changes, run `vercel --prod` once and move on
- Do NOT poll deployment status or wait for Vercel to finish
- Do NOT cancel or retry deployments
- Do NOT run `vercel inspect` or check deployment status

## Tech Stack
- React + Vite + TypeScript + Tailwind CSS v4
- Two Supabase clients: auth (iauulqfgrbegwcnfatmx) and data (xdiqvvctdwbexfyoqrzh)
- Deployed on Vercel at board.njd-services.net
- Shared navbar web component is **vendored locally** at `public/njd-navbar.js` (served same-origin as `/njd-navbar.js` from index.html). Source of truth stays in the Landing Page project — do NOT edit the vendored copy in place (changes are lost on next sync). To re-vendor after a Landing update: copy Landing's `public/njd-navbar.js` → this repo's `public/njd-navbar.js`, update the vendor header (Last synced / SHA-256 / MD5), do the same in the HR repo. Same-origin loading avoids cross-origin CSP issues (Vercel 307s the apex `njd-services.net` → `www.njd-services.net`).
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
