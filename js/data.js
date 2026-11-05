/* Event catalogue. Dates are ISO strings in IST (+05:30).
   `booked` is a baseline of seats already taken; registrations saved in
   Local Storage are subtracted on top of it. */
window.EVENTS = [
  {
    id: 'old-city-photo-walk',
    title: 'Old City Photo Walk',
    category: 'Workshop',
    date: '2026-11-15T06:30:00+05:30',
    end: '2026-11-15T09:30:00+05:30',
    venue: 'Lingaraj Temple Road',
    city: 'Bhubaneswar',
    price: 299,
    seats: 30,
    booked: 30,
    featured: false,
    organizer: 'Frame & Field Collective',
    short: 'A sunrise walk through heritage lanes with a working street photographer.',
    description: [
      'Catch the golden hour in the oldest quarter of the city. You will learn how to read light, compose candid street frames and talk to strangers without making it awkward.',
      'Bring any camera, a phone works perfectly. The walk ends with a quick critique session over tea.'
    ],
    agenda: [
      { time: '06:30', item: 'Meet-up and light basics' },
      { time: '07:00', item: 'Walk: temple lanes and markets' },
      { time: '08:45', item: 'Portfolio critique over chai' }
    ],
    tags: ['photography', 'outdoors', 'beginner friendly']
  },
  {
    id: 'neon-nights-live',
    title: 'Neon Nights Live',
    category: 'Music',
    date: '2026-11-21T19:00:00+05:30',
    end: '2026-11-21T23:00:00+05:30',
    venue: 'Open Air Theatre',
    city: 'Bhubaneswar',
    price: 799,
    seats: 1200,
    booked: 1046,
    featured: true,
    organizer: 'Pulse Entertainment',
    short: 'Four synth-pop and electronic acts, one massive light show under the open sky.',
    description: [
      'Neon Nights brings together four of the country\u2019s most exciting electronic acts for a single night of synths, basslines and a fully choreographed LED stage.',
      'Food trucks open at 6 PM. Entry closes at 9 PM. The venue is fully accessible.'
    ],
    agenda: [
      { time: '18:00', item: 'Gates and food trucks open' },
      { time: '19:00', item: 'Opening DJ set' },
      { time: '20:15', item: 'Live acts, back to back' },
      { time: '22:30', item: 'Headliner and light show finale' }
    ],
    tags: ['live music', 'electronic', 'night']
  },
  {
    id: 'hackfest-2026',
    title: 'HackFest 2026: 36-Hour Build Sprint',
    category: 'Tech',
    date: '2026-11-28T09:00:00+05:30',
    end: '2026-11-29T21:00:00+05:30',
    venue: 'Campus Innovation Hub',
    city: 'Bhubaneswar',
    price: 0,
    seats: 400,
    booked: 312,
    featured: true,
    organizer: 'Developer Circle',
    short: 'Form a team, pick a track and ship a working product in 36 hours.',
    description: [
      'Five tracks: AI agents, climate, fintech, health and open innovation. Mentors from product companies will be on the floor through the night.',
      'Meals, swag and a quiet nap zone are included. Teams of 2 to 4, solo hackers get matched on day one.'
    ],
    agenda: [
      { time: 'Day 1 09:00', item: 'Check-in and team formation' },
      { time: 'Day 1 11:00', item: 'Hacking begins' },
      { time: 'Day 2 15:00', item: 'Code freeze' },
      { time: 'Day 2 17:00', item: 'Demos and awards' }
    ],
    tags: ['hackathon', 'coding', 'prizes', 'free']
  },
  {
    id: 'design-systems-bootcamp',
    title: 'Design Systems Bootcamp',
    category: 'Workshop',
    date: '2026-12-05T10:00:00+05:30',
    end: '2026-12-05T17:00:00+05:30',
    venue: 'The Studio, Koramangala',
    city: 'Bengaluru',
    price: 1499,
    seats: 60,
    booked: 41,
    featured: false,
    organizer: 'Pixel Guild',
    short: 'Build a token-based design system from scratch and hand it off to code.',
    description: [
      'A hands-on day covering design tokens, component anatomy, accessibility checks and developer handoff.',
      'You leave with a starter system file and a component library template. Laptop required.'
    ],
    agenda: [
      { time: '10:00', item: 'Tokens: colour, type, spacing' },
      { time: '12:00', item: 'Components and variants' },
      { time: '14:30', item: 'Accessibility review' },
      { time: '16:00', item: 'Handoff to developers' }
    ],
    tags: ['ui', 'ux', 'design', 'hands-on']
  },
  {
    id: 'genai-builders-summit',
    title: 'GenAI Builders Summit',
    category: 'Tech',
    date: '2026-12-12T09:30:00+05:30',
    end: '2026-12-12T18:00:00+05:30',
    venue: 'Convention Centre, Whitefield',
    city: 'Bengaluru',
    price: 2499,
    seats: 800,
    booked: 590,
    featured: true,
    organizer: 'Builders Network',
    short: 'Talks and live demos from teams shipping AI products to millions of users.',
    description: [
      'A practitioner-first summit: no hype decks, only real architecture diagrams, evaluation setups and cost breakdowns from production AI teams.',
      'Includes a startup demo alley and a hiring lounge.'
    ],
    agenda: [
      { time: '09:30', item: 'Keynote: shipping agents to production' },
      { time: '11:00', item: 'Evals, guardrails and cost' },
      { time: '14:00', item: 'Startup demo alley' },
      { time: '16:30', item: 'Panel: the next 12 months' }
    ],
    tags: ['ai', 'conference', 'networking']
  },
  {
    id: 'odissi-under-the-stars',
    title: 'Odissi Under the Stars',
    category: 'Cultural',
    date: '2026-12-14T18:30:00+05:30',
    end: '2026-12-14T21:00:00+05:30',
    venue: 'Rabindra Mandap Lawns',
    city: 'Bhubaneswar',
    price: 199,
    seats: 500,
    booked: 268,
    featured: false,
    organizer: 'Kala Sangam',
    short: 'An open-air evening of classical Odissi performances with live music.',
    description: [
      'Celebrated dancers perform traditional and contemporary Odissi pieces accompanied by a live ensemble.',
      'A short introduction before each piece explains the story and mudras, so first-timers can follow along.'
    ],
    agenda: [
      { time: '18:30', item: 'Welcome and invocation' },
      { time: '19:00', item: 'Solo performances' },
      { time: '20:15', item: 'Ensemble finale' }
    ],
    tags: ['dance', 'classical', 'heritage']
  },
  {
    id: 'sunrise-half-marathon',
    title: 'Sunrise City Half Marathon',
    category: 'Sports',
    date: '2026-12-20T05:30:00+05:30',
    end: '2026-12-20T10:00:00+05:30',
    venue: 'Kalinga Stadium',
    city: 'Bhubaneswar',
    price: 649,
    seats: 3000,
    booked: 2120,
    featured: true,
    organizer: 'Run Odisha',
    short: '21K, 10K and 5K routes through the city, timed with chip bibs.',
    description: [
      'Choose your distance and run through closed roads at sunrise. Every finisher gets a medal and a timing certificate.',
      'Hydration stations every 2.5 km, medical support on route and a post-race breakfast.'
    ],
    agenda: [
      { time: '05:00', item: 'Bib collection and warm-up' },
      { time: '05:30', item: '21K flag-off' },
      { time: '06:00', item: '10K and 5K flag-off' },
      { time: '08:30', item: 'Medals and breakfast' }
    ],
    tags: ['running', 'fitness', 'outdoors']
  },
  {
    id: 'founders-pitch-night',
    title: 'Founders\u2019 Pitch Night',
    category: 'Business',
    date: '2027-01-09T18:00:00+05:30',
    end: '2027-01-09T21:30:00+05:30',
    venue: 'WeWork, BKC',
    city: 'Mumbai',
    price: 499,
    seats: 150,
    booked: 97,
    featured: false,
    organizer: 'Seed Street',
    short: 'Ten early-stage startups pitch live to a panel of angels and VCs.',
    description: [
      'Watch ten handpicked startups pitch for five minutes each, followed by tough, honest Q&A from investors.',
      'Stay for open networking. Founders looking to pitch at the next edition can apply at the venue.'
    ],
    agenda: [
      { time: '18:00', item: 'Networking' },
      { time: '18:45', item: 'Pitches, round one' },
      { time: '20:00', item: 'Pitches, round two' },
      { time: '21:00', item: 'Investor verdicts' }
    ],
    tags: ['startups', 'funding', 'networking']
  },
  {
    id: 'campus-esports-cup',
    title: 'Campus Esports Cup',
    category: 'Sports',
    date: '2027-01-16T11:00:00+05:30',
    end: '2027-01-17T20:00:00+05:30',
    venue: 'HITEX Exhibition Hall',
    city: 'Hyderabad',
    price: 349,
    seats: 256,
    booked: 247,
    featured: false,
    organizer: 'Respawn League',
    short: 'Inter-college tournament with a live-streamed grand final on the big screen.',
    description: [
      'Teams from 40 colleges compete across two days in a double-elimination bracket. Spectator passes include a seat for the grand final.',
      'Players must carry a valid college ID at check-in.'
    ],
    agenda: [
      { time: 'Day 1 11:00', item: 'Group stage' },
      { time: 'Day 2 12:00', item: 'Playoffs' },
      { time: 'Day 2 18:00', item: 'Grand final' }
    ],
    tags: ['gaming', 'tournament', 'students']
  },
  {
    id: 'winter-indie-fest',
    title: 'Winter Indie Fest',
    category: 'Music',
    date: '2027-01-23T16:00:00+05:30',
    end: '2027-01-23T23:00:00+05:30',
    venue: 'Koregaon Park Grounds',
    city: 'Pune',
    price: 999,
    seats: 2000,
    booked: 820,
    featured: false,
    organizer: 'Backstage Collective',
    short: 'Eight independent bands, a vinyl market and a lot of good coffee.',
    description: [
      'An afternoon-to-night celebration of independent music across two stages, with a record market and local food stalls.',
      'Bring a blanket for the lawn stage.'
    ],
    agenda: [
      { time: '16:00', item: 'Gates open, vinyl market' },
      { time: '17:00', item: 'Lawn stage sets' },
      { time: '20:00', item: 'Main stage headliners' }
    ],
    tags: ['indie', 'live music', 'festival']
  },
  {
    id: 'short-film-festival',
    title: 'Reel Shorts Film Festival',
    category: 'Cultural',
    date: '2027-02-06T14:00:00+05:30',
    end: '2027-02-06T21:00:00+05:30',
    venue: 'Phoenix Marketcity Screens',
    city: 'Chennai',
    price: 249,
    seats: 300,
    booked: 140,
    featured: false,
    organizer: 'Reel Society',
    short: 'Screenings of 15 award-winning short films followed by director Q&As.',
    description: [
      'Fifteen short films across fiction, documentary and animation, curated from over 600 submissions.',
      'Each block ends with a conversation with the filmmakers.'
    ],
    agenda: [
      { time: '14:00', item: 'Block A: Fiction' },
      { time: '16:30', item: 'Block B: Documentary' },
      { time: '19:00', item: 'Block C: Animation and awards' }
    ],
    tags: ['film', 'cinema', 'q&a']
  },
  {
    id: 'cloud-native-workshop',
    title: 'Cloud Native Workshop',
    category: 'Tech',
    date: '2026-10-18T10:00:00+05:30',
    end: '2026-10-18T16:00:00+05:30',
    venue: 'Campus Innovation Hub',
    city: 'Bhubaneswar',
    price: 0,
    seats: 120,
    booked: 120,
    featured: false,
    organizer: 'Developer Circle',
    short: 'Containers, Kubernetes and CI/CD pipelines from zero to deployed.',
    description: [
      'A practical workshop where every attendee deployed a containerised app to a Kubernetes cluster with an automated pipeline.',
      'Slides and recordings are shared with registered attendees.'
    ],
    agenda: [
      { time: '10:00', item: 'Containers 101' },
      { time: '12:00', item: 'Kubernetes basics' },
      { time: '14:30', item: 'CI/CD pipeline' }
    ],
    tags: ['cloud', 'devops', 'free']
  }
];
