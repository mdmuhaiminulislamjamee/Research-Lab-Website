# Open Frontier Lab — v1

A responsive, data-driven virtual research lab. The organization name, people, papers, funding, and academic affiliations are **demo content**. No photo or video files are included. Missing media uses initials, drawn diagrams, or a clear availability message.

## Run locally

Requires Node.js 20 or newer. No package installation is needed.

```powershell
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Run `npm run check` to validate the content, routes, render functions, and key interactions. Stop the server with Ctrl+C.

## Update the content

Edit **`dist/content.json`**. It is fetched by the site at runtime, and supplies all member, lab, course, project, event, paper, news, contact, and media records. Refresh the page after editing. Keep valid JSON: double-quoted keys/strings, no trailing commas, no comments.

- `organization`: site name, mission, editable stats, email, address, social URLs, and optional form endpoints.
- `members`: role/group, bio, full portfolio, interests, education, publications, linked projects, joining year, email and academic profiles. Each member has a visible **View portfolio** link at `/team/[slug]`.
- Team order follows `teamGroups`: Director → Team Leaders → Technical Officers → Organizers → Advisory Panel.
- `labs`: overview, focus areas, mentors, recordings, papers/notes, related courses/projects, internship and certificate details.
- `projects`: overview, leader, team, funding, papers, explanation videos, repository and supporting documents.
- `courses`: level, status, duration, instructor, prerequisites, modules, videos and assignments.
- `events`: dates including UTC offset, IANA timezone, speaker, agenda, recording, slides, photos and report. Upcoming/past is determined automatically from the event end time.
- `publications`: title, authors, year, venue, DOI/paper URL and PDF URL.

Use `null` for links/media that are not ready. Paste a full Google Scholar URL into a member's `scholar` field; the profile and team link become active automatically. Media URL fields accept HTTPS URLs or root-relative paths such as `/assets/nadia.jpg`. Add your own files to `dist/assets/` if using local paths. Video fields accept standard YouTube watch/short links, Vimeo links, or direct MP4/WebM/OGG files. Event photos can be `{ "url": "/assets/session.jpg", "alt": "A useful description" }` objects.

To add a person, duplicate a member record, give it a unique lowercase hyphenated `slug`, and enter a valid group. Connect projects/publications with their IDs. Run `npm run build` after adding/removing records or changing slugs to regenerate directly accessible routes and the sitemap. Run `npm run check` before deployment. Do not run `scripts/seed-content.mjs` after entering real content: it resets the JSON to the initial demo.

## Included pages & interactions

Home, About, hierarchical Team and individual portfolios, two Labs and detail pages, five Courses and detail pages, four Projects with six accessible detail tabs, Events and detail pages, Publications, Contact, and My Registrations. Includes global search, member/year filtering, course levels, funded-project filtering, event/year filtering, calendar downloads, browser-saved registration/enrollment interests, and CSV export. Sticky navigation, mobile menu, keyboard controls, reduced-motion support, page metadata, sitemap, and 404 handling are included.

## Forms in v1

Forms clearly identify the default **device-only demo mode**. Interest records stay in browser local storage. They do not reserve places, enroll people, send mail, issue certificates, or create a shared attendee database. My Registrations exports only that browser's records. Contact prepares a draft in the visitor's email app.

For real submissions, set the relevant `organization.registrationEndpoint`, `enrollmentEndpoint`, `newsletterEndpoint`, and/or `contactEndpoint` to your HTTPS form service. Endpoints must accept a cross-origin JSON POST and return a 2xx response only when accepted. Configure spam protection, email confirmations, meeting-link delivery and shared admin exports in that service. Endpoint URLs are public; never put private API keys or secrets in JSON. The site shows a submitted state only after an endpoint accepts the request. A full authenticated admin backend is not included in this static v1.

Certificate requirements and internship details are editable content; certificate issuance is an organizer workflow.

## Hosting & verification

The site uses a buildless static `dist` directory. `npm run build` generates HTML entrypoints with unique metadata for every current route, plus a sitemap. Content is rendered by JavaScript. The canonical origin is set in `scripts/build.mjs`; update it if moving to your own domain.

Automated checks cover generated routes, internal links, JSON relationships, template rendering, all member portfolio links, project tabs, search, filtering, registration dialog fields, device storage, and URL escaping. A live browser was unavailable during this session, so visual and mobile browser QA remain unverified.

Google Fonts is optional: system-font fallbacks keep the site usable if external fonts are blocked. No application runtime dependencies or tracking scripts are required.
