# Spotlight: Responsive Event Management Website

Spotlight is a fully responsive event platform where users can discover upcoming events, search and filter them, read full details and register through a validated form. Registrations are stored in the browser with Local Storage, so the site works without any backend.

Built for **K Explore, Web Designing** using only **HTML5, CSS3 and vanilla JavaScript**. No frameworks, no build step, no external images.

**Live demo:** `https://<your-username>.github.io/spotlight/` (replace after deploying)
**Repository:** `https://github.com/<your-username>/spotlight`

---

## Features

### Core requirements
| Requirement | How it is implemented |
|---|---|
| Attractive hero section | Animated gradient background, headline, search bar, live stats counter, and a "Next up" event card with a running countdown |
| Upcoming and featured events | Separate "Featured events" and "Coming up soon" sections on the homepage |
| Event cards | Image, name, date, venue, short description, price, category and availability badges |
| Search | Live search (debounced) across title, venue, city, category, organiser and tags, with matched text highlighted |
| Category filter | Filter chips with live result counts, plus category tiles on the homepage |
| Event details page | Description, date/time, venue, organiser, schedule timeline, tags, seats remaining and related events |
| Registration form | Name, email, phone, selected event, ticket count and consent checkbox |
| JavaScript validation | Per-field rules, inline error messages, validation on blur then live while typing, duplicate-registration check |
| Confirmation message | Success dialog with a generated ticket ID and booking summary, plus a toast and confetti |
| Responsive | Tested at 390px (phone), 820px (tablet) and 1280px (desktop); mobile hamburger menu and bottom-sheet modal |

### Bonus challenges (all four done)
- **Dark / light mode:** respects the OS preference on first visit, remembers the user's choice, and applies it before first paint so there is no flash.
- **Countdown timers:** live days/hours/minutes/seconds on the hero card and every event detail page; switches to "Happening now" when the event starts.
- **Animations:** scroll-reveal cards, page transitions, hover lifts, animated stat counters, checkmark draw-in, confetti. All motion is disabled for users with `prefers-reduced-motion`.
- **Local Storage registration management:** a "My Registrations" page lists every booking with cancel, clear all and **export to CSV**. Seat counts update live as you register or cancel, and changes sync across open tabs.

### Extras
- Shareable URLs for every view and filter state (`#/events?q=hackathon&cat=Tech`)
- "Add to calendar" button that downloads a standard `.ics` file
- Share button (native share sheet on mobile, copy link on desktop)
- Sort by date, popularity or price, and a toggle to include past events
- Sold out, few seats left, live and ended states handled throughout
- Form draft is saved, so closing the modal by accident does not lose typed details
- Unique, generated SVG cover art per event, so no image links can break
- Accessibility: skip link, semantic landmarks, labelled inputs, `aria-invalid`, `aria-live` regions, focus trap in dialogs, Esc to close, visible focus rings

---

## Validation rules

| Field | Rule |
|---|---|
| Event | Required; must be upcoming and not sold out |
| Full name | 3 to 60 characters; letters, spaces, dots, hyphens and apostrophes only (Unicode letters allowed) |
| Email | Standard `name@domain.tld` format, no consecutive dots |
| Phone | 10-digit Indian mobile number starting with 6 to 9; accepts spaces, dashes and an optional `+91` or `0` prefix |
| Tickets | 1 to 5, and never more than the seats left |
| Consent | Checkbox must be ticked |
| Duplicate | The same email cannot register twice for the same event |

---

## Tech stack

- **HTML5:** semantic structure, single `index.html`
- **CSS3:** custom properties (design tokens) for theming, Grid and Flexbox layouts, `clamp()` fluid type, `color-mix()`, keyframe animations, media queries
- **JavaScript (ES2017+):** hash-based router, template rendering, Intersection Observer, Intl date and currency formatting, Local Storage, Blob downloads
- **Fonts:** Inter and Space Grotesk via Google Fonts

## Project structure

```
spotlight/
├── index.html        # App shell: nav, main outlet, footer, modal, toasts
├── css/
│   └── style.css     # Design tokens, components, dark theme, responsive rules
├── js/
│   ├── data.js       # Event catalogue (edit this to add events)
│   └── app.js        # Router, views, search/filter, form validation, storage
└── README.md
```

## How it works

- **Routing:** `app.js` reads `location.hash` and renders one of four views: Home (`#/`), Events (`#/events`), Event detail (`#/event/:id`) and My Registrations (`#/registrations`). Hash routing means it works on any static host with no server config.
- **State:** event data lives in `data.js`. Registrations are an array in Local Storage under `spotlight-registrations`. Seats left are calculated as `seats - booked - tickets you booked`, so the UI stays consistent everywhere.
- **Search and filters:** the filter state is kept in one object and mirrored into the URL with `history.replaceState`, so searches are shareable and the input keeps focus while results update.
- **Cover images:** each event's cover is an SVG generated from a hash of its ID and its category colours, so every card looks distinct without loading any image files.

### Adding an event
Add an object to `window.EVENTS` in `js/data.js`:

```js
{
  id: 'my-event', title: 'My Event', category: 'Tech',  // Tech | Music | Workshop | Cultural | Sports | Business
  date: '2027-03-01T10:00:00+05:30', end: '2027-03-01T17:00:00+05:30',
  venue: 'Main Hall', city: 'Bhubaneswar', price: 0, seats: 200, booked: 0,
  featured: false, organizer: 'Team', short: 'One-line summary.',
  description: ['Paragraph one.'], agenda: [{ time: '10:00', item: 'Start' }], tags: ['tag']
}
```

---

## Run locally

No install needed. Either open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

**GitHub Pages**
1. Push this folder to a GitHub repository.
2. Go to *Settings → Pages*, choose *Deploy from a branch*, select `main` and `/ (root)`.
3. The site is live at `https://<username>.github.io/<repo>/` within a minute.

**Netlify:** drag and drop the folder at app.netlify.com/drop, or connect the repo with no build command and publish directory `.`

**Vercel:** import the repo, framework preset *Other*, no build command, output directory `.`

---

## Testing done

Tested in Chromium at phone, tablet and desktop widths: search, category filters, sorting, every validation error path, successful registration, duplicate detection, cancel and clear all, CSV export, theme persistence, and no horizontal scrolling on mobile. The browser console is clean.

## Author

Kartikeya Trivedi, B.Tech CSE, KIIT University
