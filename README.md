# Open Frontier Lab: v1

A responsive research lab website for artificial intelligence in power systems and applied quantum machine learning, with editable projects, publications, courses, events, and team portfolios. The organization name, people, papers, funding, and academic affiliations are **demo content**. No photo or video files are included. Missing media uses initials, drawn diagrams, or a clear availability message.

## Run locally

Requires Node.js 20 or newer. No package installation is needed.

```powershell
npm run build
npm run dev
```

Open http://localhost:4173. `npm run dev` also builds the pages automatically, so you can use that command alone to get started. `npm start` does the same. Run `npm run check` to validate the content, routes, render functions, and key interactions. Stop the server with Ctrl+C.

In this workspace, the same npm commands also work from the parent `OFL` folder. When using the standalone source ZIP, run them from the extracted folder containing `package.json`. If port 4173 is already occupied, the server automatically tries the next available port through 4183. Open the exact `Local:` URL printed in your terminal.

## Update the content

Edit **`dist/content.json`**. It is fetched by the site at runtime, and supplies all member, lab, course, project, event, paper, news, contact, and media records. Refresh the page after editing. Keep valid JSON: double-quoted keys/strings, no trailing commas, no comments.

- `organization`: site name, mission, editable stats, email, address, social URLs, and optional form endpoints.
- `home`: homepage hero, introduction, research areas, featured-event selection, section headings, and contact section. Its initial demo defaults are in `scripts/home-defaults.json`.
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

## Portable files & verification

The website is a standalone static project. `npm run build` generates HTML entrypoints with unique metadata for every current route. Content is rendered by JavaScript. All app links and assets use local paths, with no account or deployment service required.

For a new GitHub repository, extract `virtual-lab-v1-source.zip` into a fresh folder and initialize Git there. The ZIP contains the current source without previous repository history. No remote is configured, and no deployment runs automatically. The site files are in `dist/`; `scripts/` contains the local server, build, and checks. A future static deployment can run `npm run build` and use `dist` as its output directory.

When you have your own domain, optionally set `SITE_URL` before building to generate its canonical URLs and sitemap:

```powershell
$env:SITE_URL = 'https://your-domain.example'
npm run build
```

Leave `SITE_URL` unset for localhost. No domain is hardcoded into the source. A local build removes any previous sitemap and domain metadata.

Automated checks cover generated routes, internal links, JSON relationships, template rendering, all member portfolio links, project tabs, search, filtering, registration dialog fields, device storage, and URL escaping. A live browser was unavailable during this session, so visual and mobile browser QA remain unverified.

The serif fallback font and its license are bundled locally in `dist/fonts/`, together with their SIL Open Font License files. The interface does not request fonts from an external service. System-font fallbacks remain available. No application runtime dependencies or tracking scripts are required.

## Appearance and header registration

Every page uses the same serif visual system: Times New Roman with a local Source Serif fallback, midnight navy and deep purple surfaces, white text in the hero, cyan details, coral-to-amber actions, rounded cards, and gentle hover glows. The homepage retains its current section order. Typography, spacing, cards, tabs, forms, and dialogs share the same appearance on all routes.

The website uses only its light appearance: a white page background and header with colored navy/purple sections. There is no theme switch. Previously saved appearance preferences are cleared automatically; other saved device records are preserved. Global search searches people, labs, projects, courses, papers, and events.

The Register button is always at the far right, including on mobile. Its destination is configured in dist/content.json:

```json
"organization": {
  "registrationUrl": null
}
```

Replace null with your full HTTPS Google Form link, save the JSON, and refresh the page. Register then redirects to that form. Until a valid URL is configured, it opens an informative registration notice. This field is separate from registrationEndpoint, which handles the existing in-site event interest forms.

Edit the home object in dist/content.json to update homepage text and actions. The homepage uses opaque navy/purple color fields based on the latest supplied bunny.net screenshot. Its two lab links remain available below the hero actions. The legacy home.heroBackground and home.heroImage fields are null and not rendered. Event and project image fields remain available. No reference photos are included.

The shared appearance is in dist/appearance.css. dist/styles.css supplies the underlying layout, and dist/home.js renders the homepage and shared footer. Hover effects apply to cards, research areas, publications, links, buttons, resources, filters, and profiles. Keyboard focus is visible. Reduced-motion preferences disable movement and keep content visible.

The latest bunny.net screenshot defines the palette: midnight navy #101233, deep purple #29144E, white, cyan #72D4E9, and coral #FF7958 to amber #FFB443. The site uses a white page background and white header with deep navy text between colored sections, navy/purple heroes, and coral-to-amber actions. All 32 pages share the same diagonal navy/purple page headers, matching section bands, colored cards, cyan details, and coral-to-amber primary actions. Team portfolios and lab, course, project, and event details use the same template as the homepage. Panels are opaque and there are no glass, blur, or transparent photo effects. The sunset background is removed.

The shared reference pattern also styles featured events, collaboration panels, contact information, and the footer. Directory cards alternate matching purple and blue fills. Forms, filters, tabs, dialogs, sidebars, empty states, and newsletters use the same palette. Automated checks render every tested route in the light-only appearance and verify that inner pages retain the shared page header.

Navy/purple section panels and cards retain white/cyan text while surrounding whitespace, navigation, standalone forms, filters, and dialogs use a white canvas with deep navy text. Button glow is removed, shadows are lighter, and card hover movement is restrained.

## Responsive layout

Shared page containers, the homepage hero, navigation, collaboration panel, and footer content expand with the available display width instead of stopping at 1280px. Outer gutters scale from 12px to 28px per side. Section spacing, hero padding, heading size, and grid gaps scale within readable limits. Project, publication, course, and general card grids fit columns to the available width; detail-page sidebars stack below 820px. Sections keep natural content height instead of clipping content to a fixed screen height. Body copy on detail pages retains a readable line length.
