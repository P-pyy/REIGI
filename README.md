# REIGI

REIGI is a web-based registrar information and queue system for the University of Rizal System – Antipolo Campus. It gives students access to registrar announcements, frequently asked questions, enrollment and document-request information, and an academic calendar. It also provides a kiosk and administrative interface for managing inquiries and office queues.

## Features

- Public information hub for announcements, FAQs, registrar procedures, and academic calendars
- FAQ sections for enrollment, document requests, and graduation and clearance
- Searchable announcements and FAQ content
- Interactive kiosk for document requests, enrollment inquiries, and claiming documents
- Queue number generation with regular and priority lanes
- Admin queue management for active, processing, and completed requests
- TV display for queue numbers and waiting tickets
- Admin dashboard with visitor, FAQ, announcement, device, and media statistics
- Role-based admin access using Supabase Auth
- Content management for FAQs, announcements, images, videos, and calendars
- Realtime updates through Supabase subscriptions
- Optional voice search, read-aloud controls, and queue announcements

## Stack

- Node.js
- Express 5
- EJS with `express-ejs-layouts`
- Vanilla JavaScript and CSS
- Supabase for authentication, database, storage, and realtime updates
- Bootstrap and Phosphor Icons through the frontend layouts

## Project structure

```text
REIGI/
├── config/                 Supabase configuration
├── middleware/             Authentication and admin access middleware
├── public/
│   ├── css/                Page and component stylesheets
│   ├── img/                Images and static media
│   ├── js/                 Client-side modules and Supabase interactions
│   └── kiosk/              Kiosk-specific frontend assets
├── routes/                 Express route modules, including kiosk routes
├── views/
│   ├── admin/              Admin login, dashboard, content, and settings pages
│   ├── client/             Public home, FAQ, and announcement pages
│   ├── kiosk/              Kiosk queue and TV display pages
│   └── partials/           Shared admin, client, and kiosk components
├── server.js               Express application and API endpoints
├── package.json            Node.js dependencies and scripts
└── .env                    Local environment variables (not committed)
```

## How it works

`server.js` configures Express, serves the static files in `public`, renders EJS views, and exposes the public, admin, kiosk, and API routes. The public pages use the Supabase browser client to load announcements, FAQ data, site media, calendars, and visitor statistics.

Admin requests under `/admin` pass through `middleware/auth.js`. The middleware validates the access token with Supabase Auth, looks up the user's role in `campus_accounts`, and allows `admin`, `super_admin`, or `window_admin` accounts to continue. The kiosk and queue interface uses Supabase tables and realtime channels to coordinate active windows, queue states, and the TV display.

## Requirements

- Node.js 18 or newer
- A Supabase project
- A configured Supabase database, Auth setup, and storage bucket used by the application
- A printer setup if the document queue stub printing features are enabled

## Installation

```bash
git clone https://github.com/P-pyy/REIGI.git
cd REIGI
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Do not commit `.env` or expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code. The service-role key is used by the server for protected operations such as admin authentication and should remain private.

## Running the application

The project currently does not define an npm `start` script. Start the Express server directly:

```bash
node server.js
```

Then open:

- Public site: `http://localhost:3000/`
- FAQ page: `http://localhost:3000/faq`
- Announcements: `http://localhost:3000/announcement`
- Admin login: `http://localhost:3000/admin/login`
- Kiosk: `http://localhost:3000/kiosk`
- Queue TV display: `http://localhost:3000/kiosk/tv`

## Supabase data used by the application

The application reads and writes to tables and services including:

- `announcements`
- `faqs`
- `kiosk`
- `queue`
- `visitors`
- `sitemedia`
- `campus_accounts`
- `active_windows`
- Supabase Auth
- Supabase Storage bucket `kiosk`

The exact columns, policies, roles, and realtime settings must be configured in the Supabase project before all features will work.

## Available command

The package currently includes a placeholder test command:

```bash
npm test
```

It exits with `Error: no test specified`; automated tests have not been configured yet.

## Security notes

- Keep `.env` out of version control.
- Keep `SUPABASE_SERVICE_ROLE_KEY` on the server only.
- Review Supabase Row Level Security policies before deploying.
- Set secure cookies and HTTPS settings for production. The current development cookie configuration uses `secure: false`.
