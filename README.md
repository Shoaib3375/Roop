# Roop Management

Model management site built with Next.js 14 (App Router), React 18 and TypeScript.

The app uses Next.js route handlers as Node.js serverless functions when deployed to a serverless platform such as Vercel. The booking enquiry API runs in the Node.js runtime; there is no separate always-on Express server.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Routes

| Route          | What it is                                      |
| -------------- | ----------------------------------------------- |
| `/`            | Home, about, how to join                        |
| `/roster`      | Roster with board, city and name filters        |
| `/model/[id]`  | Public model profile and booking enquiry        |
| `/join`        | 5-step profile builder with live preview        |
| `/mine`        | Your profile status, edit, delete               |
| `/model/me`    | Your public page (after approval)               |
| `/signup`      | Create an account with email confirmation       |
| `/login`       | Sign in to manage your application              |
| `/forgot-password` | Request a password reset                    |
| `/admin`       | Staff-only application review and approval     |

## Notes

- All 12 models and the agency details are fictional sample data (`lib/data.ts`).
- Registration and login use Supabase Auth (email/password and email confirmation).
- Submitted applications are stored in the Supabase `model_profiles` table under row-level security. Profile photos are held in a private Supabase Storage bucket and are only signed for the authenticated owner.
- In-progress edits stay in memory in the current tab until submitted; they are not saved to browser storage.
- Review status cannot be changed by an applicant. Authorized admins use `/admin` to approve or reject applications; approving makes only the explicitly public profile fields visible on the roster.
- Booking enquiries are sent by `POST /api/enquiries` to the server-side webhook configured as `ROOP_ENQUIRY_WEBHOOK`. Set this environment variable in your deployment settings; never expose it with a `NEXT_PUBLIC_` prefix.
- Without `ROOP_ENQUIRY_WEBHOOK`, the API responds with a setup error and does not persist submissions. Connect the webhook to a trusted service that handles enquiries (for example, an email workflow or queue).

## Serverless backend

`app/api/enquiries/route.ts` is a Node.js App Router route handler. It validates and bounds the request fields, then forwards the enquiry to the configured HTTPS webhook. Deploy the Next.js app to a compatible Node.js serverless platform and set `ROOP_ENQUIRY_WEBHOOK` to the webhook URL in that platform's environment settings. Configure it for local development in `.env.local` (do not commit secrets).

Test the function locally with `npm run dev`, then submit an enquiry from any model profile. The endpoint returns `202` when the webhook accepts it, `503` when no webhook is configured, and appropriate errors for invalid requests or delivery failures.

## Account and registration setup

1. Create a Supabase project and copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project API settings. A publishable/anon key is intended for browser use; never put a secret/service-role key, database password, or JWT secret in a `NEXT_PUBLIC_` variable.
2. Run `supabase/schema.sql` for a fresh project, or apply the versioned files in `supabase/migrations/` to an existing CLI-linked project. They create the application table, row-level security policies, admin role checks, a public-safe approved-profile view, status protection, and private photo storage.
3. In Supabase Authentication settings, enable email/password, configure the site's URL (for local use `http://localhost:3000`), and allow the callback URL `http://localhost:3000/auth/callback`. Add the production callback URL when deploying.
4. Start the app. Register at `/signup`, confirm the email, sign in at `/login`, then complete the application at `/join`. Password reset starts at `/forgot-password`.

Submitted profile records and pending/rejected media are private to the applicant and admins. To grant staff access, open Supabase Dashboard → Authentication → Users → select the staff account → edit **App Metadata** to include `{"role":"admin"}` (never use User Metadata), save, then have that staff member sign out and back in to refresh the claim. The staff-only `/admin` dashboard can approve or reject; approval publishes safe fields through `public_model_profiles` and allows the approved photos to be signed for public display. Demo/sample profiles remain in `lib/data.ts`.
# Roop
