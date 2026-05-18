export const TABS = [
  { id: 'today',  label: 'News+',  navLabel: 'For You' },
  { id: 'world',  label: 'World',  navLabel: 'World'   },
  { id: 'sports', label: 'Sports', navLabel: 'Sports'  },
];

export const HERO_STORIES = {
  today: {
    tag: 'Top Story',
    title: 'Global Leaders Reach Historic Climate Deal',
    source: 'Daily News',
    description: 'World leaders announced a climate agreement focused on emissions targets, clean energy investment, and shared infrastructure goals.',
    image: 'linear-gradient(160deg, #3a1a00 0%, #8b2500 42%, #c0392b 78%, #e8180c 100%)',
  },
  world: {
    tag: 'World',
    title: 'Diplomats Open New Round of Global Security Talks',
    source: 'World Desk',
    description: 'Delegates are meeting this week to discuss regional security, trade policy, and new diplomatic channels.',
    image: 'linear-gradient(160deg, #1f2f46 0%, #27526f 45%, #3f8ca8 100%)',
  },
  sports: {
    tag: 'Sports Highlight',
    title: 'Underdogs Stun Favorites in Championship Finale',
    source: 'Sports Desk',
    description: 'A late surge changed the final minutes of the championship and gave fans one of the season\'s biggest upsets.',
    image: 'linear-gradient(160deg, #10235f 0%, #1d55aa 44%, #4a8dff 100%)',
  },
};

export const STORY_SECTIONS = {
  today: [
    {
      title: 'Top Stories',
      stories: [
        { source: 'The New York Times', author: 'David McCabe',    headline: 'Tech Giants Face New Antitrust Rules Across EU and US Markets',     color: 'linear-gradient(135deg, #2c4a7c 0%, #1a2f4f 100%)' },
        { source: 'Reuters',            author: 'Andrea Shalal',   headline: 'Markets Hit Record Highs as Fed Signals Extended Rate Pause',       color: 'linear-gradient(135deg, #1a4a1a 0%, #0d2e0d 100%)' },
        { source: 'BBC News',           author: 'Jonathan Amos',   headline: 'Space Tourism Takes Off After First Civilian Orbit Mission',        color: 'linear-gradient(135deg, #4a1a4a 0%, #2e0d2e 100%)' },
        { source: 'The Guardian',       author: 'Hannah Devlin',   headline: 'Breakthrough in Cancer Research Offers New Treatment Hope',         color: 'linear-gradient(135deg, #7c2c2c 0%, #4f1a1a 100%)' },
      ],
    },
    {
      title: 'For You',
      stories: [
        { source: 'Wired',       author: 'Steven Levy',     headline: 'The New AI Models Reshaping How Teams Work and Create',           color: 'linear-gradient(135deg, #4a3a00 0%, #2e2400 100%)' },
        { source: 'The Verge',   author: 'Nilay Patel',     headline: 'Display Technology Points to a Brighter Device Future',           color: 'linear-gradient(135deg, #4a1a00 0%, #2e0d00 100%)' },
        { source: 'TechCrunch', author: 'Mary Ann Azevedo', headline: 'Energy Storage Startup Raises New Round for Grid Batteries',       color: 'linear-gradient(135deg, #1a4a4a 0%, #0d2e2e 100%)' },
      ],
    },
    {
      title: 'Following',
      stories: [
        { source: 'National Geographic', headline: 'Researchers Map New Deep Ocean Ecosystems',              color: 'linear-gradient(135deg, #1a3a4a 0%, #0d2430 100%)' },
        { source: 'The Atlantic',         headline: 'Remote Work Continues to Reshape Downtown Design',      color: 'linear-gradient(135deg, #3a2a4a 0%, #24182e 100%)' },
      ],
    },
  ],
  world: [
    {
      title: 'World Headlines',
      stories: [
        { source: 'Associated Press', headline: 'Global Leaders Meet for Emergency Economic Summit',         color: 'linear-gradient(135deg, #2c4a7c 0%, #1a2f4f 100%)' },
        { source: 'Reuters',          headline: 'New Trade Agreement Signals Shift in Pacific Region',       color: 'linear-gradient(135deg, #1a4a4a 0%, #0d2e2e 100%)' },
        { source: 'BBC News',         headline: 'European Capitals Prepare for Major Climate Vote',          color: 'linear-gradient(135deg, #3a2a4a 0%, #24182e 100%)' },
      ],
    },
    {
      title: 'Politics',
      stories: [
        { source: 'Politico',         headline: 'Senate Reaches Bipartisan Deal on Infrastructure Package',  color: 'linear-gradient(135deg, #3a1a00 0%, #6b3400 100%)' },
        { source: 'The Guardian',     headline: 'Elections Across Three Nations Set to Reshape Regional Power', color: 'linear-gradient(135deg, #1a2c4a 0%, #0d1a2e 100%)' },
        { source: 'Al Jazeera',       headline: 'Coalition Talks Stall as Deadline Approaches',              color: 'linear-gradient(135deg, #2c3a1a 0%, #1a240d 100%)' },
      ],
    },
    {
      title: 'Analysis',
      stories: [
        { source: 'Foreign Policy', headline: 'What the New Energy Corridor Means for Global Markets',       color: 'linear-gradient(135deg, #4a2c4a 0%, #2e1a2e 100%)' },
        { source: 'The Economist',  headline: 'How Demographic Change Is Reshaping Diplomacy',              color: 'linear-gradient(135deg, #4a2c2c 0%, #2e1a1a 100%)' },
      ],
    },
  ],
  sports: [
    {
      title: 'Top Sports News',
      stories: [
        { source: 'ESPN',               headline: 'Championship Finals Deliver a Game Seven Classic',        color: 'linear-gradient(135deg, #7c2c1a 0%, #4f1a0d 100%)' },
        { source: 'The Athletic',       headline: 'Star Athlete Signs Record-Breaking Extension',            color: 'linear-gradient(135deg, #1a2c7c 0%, #0d1a4f 100%)' },
        { source: 'Sports Illustrated', headline: 'Olympic Hopeful Breaks Record at National Meet',          color: 'linear-gradient(135deg, #2c7c1a 0%, #1a4f0d 100%)' },
        { source: 'Yahoo Sports',       headline: 'Controversial Call Sparks Instant Replay Debate',         color: 'linear-gradient(135deg, #7c4a1a 0%, #4f2e0d 100%)' },
      ],
    },
    {
      title: 'NBA',
      stories: [
        { source: 'ESPN',         headline: 'Playoff Race Heats Up as Final Week Tips Off',                  color: 'linear-gradient(135deg, #7c3a00 0%, #4f2400 100%)' },
        { source: 'The Athletic', headline: 'Trade Deadline Moves Shake Up Conference Standings',            color: 'linear-gradient(135deg, #00307c 0%, #001a4f 100%)' },
        { source: 'Bleacher Report', headline: 'Rookie Sensation Earns First All-Star Nod',                  color: 'linear-gradient(135deg, #4a1a1a 0%, #2e0d0d 100%)' },
      ],
    },
    {
      title: 'Soccer',
      stories: [
        { source: 'BBC Sport',    headline: 'Champions League Semifinal Ends in Dramatic Penalty Shootout',  color: 'linear-gradient(135deg, #1a4a1a 0%, #0d2e0d 100%)' },
        { source: 'The Guardian', headline: 'Transfer Window Opens With Record Fee on the Table',            color: 'linear-gradient(135deg, #2c4a2c 0%, #1a2e1a 100%)' },
        { source: 'ESPN FC',      headline: 'World Cup Qualifying Standings Tighten Heading Into Final Stretch', color: 'linear-gradient(135deg, #1a3a4a 0%, #0d2430 100%)' },
      ],
    },
  ],
};

export const FEED_FILTERS = {
  today:  ['All', 'Tech', 'Science', 'Economy'],
  world:  ['All', 'Politics', 'Trade', 'Security'],
  sports: ['All', 'NBA', 'Soccer', 'Olympics'],
};

export const FILTER_KEYWORDS = {
  today: {
    Tech:     ['tech', 'ai', 'digital', 'software', 'cyber', 'data', 'app', 'device', 'display'],
    Science:  ['science', 'research', 'study', 'climate', 'space', 'health', 'cancer', 'energy', 'ocean'],
    Economy:  ['market', 'econom', 'trade', 'rate', 'inflation', 'stock', 'fund', 'startup', 'raises'],
  },
  world: {
    Politics: ['election', 'politic', 'vote', 'government', 'president', 'minister', 'senate', 'coalition', 'parliament'],
    Trade:    ['trade', 'econom', 'market', 'tariff', 'sanction', 'agreement', 'summit', 'deal'],
    Security: ['security', 'military', 'defense', 'conflict', 'war', 'attack', 'nuclear', 'diplomat', 'talks'],
  },
  sports: {
    NBA:      ['nba', 'basketball', 'playoff', 'all-star', 'draft', 'rookie', 'court'],
    Soccer:   ['soccer', 'football', 'league', 'fifa', 'champions', 'transfer', 'world cup', 'premier'],
    Olympics: ['olympic', 'athlete', 'record', 'medal', 'tournament', 'championship', 'final'],
  },
};

export const LIVE_SECTION_TITLES = {
  today:  'Top Stories',
  world:  'World Headlines',
  sports: 'Top Sports News',
};

export const TRENDING_SEARCHES = [
  'Climate deal', 'Tech antitrust', 'Space tourism',
  'AI models', 'Electric vehicles', 'Cancer research',
];

export const THUMBNAIL_FALLBACKS = [
  'linear-gradient(135deg, #2c4a7c 0%, #1a2f4f 100%)',
  'linear-gradient(135deg, #1a4a1a 0%, #0d2e0d 100%)',
  'linear-gradient(135deg, #4a1a4a 0%, #2e0d2e 100%)',
  'linear-gradient(135deg, #7c2c2c 0%, #4f1a1a 100%)',
  'linear-gradient(135deg, #1a4a4a 0%, #0d2e2e 100%)',
];
