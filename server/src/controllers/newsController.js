// Real-time news stories like X (Twitter)
const LIVE_NEWS_DATABASE = [
  {
    id: 'news-1',
    category: 'technology',
    categoryLabel: 'Technology & AI',
    isLive: true,
    headline: 'Autonomous AI Agents Achieve Unprecedented Benchmark on Complex Engineering Tasks',
    summary: 'A new generation of multi-agent cognitive architectures solves multi-file software engineering problems with 89% accuracy, sparking discussions across tech hubs.',
    source: 'TechWire Global',
    sourceLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=60&q=80',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    postCount: 64200,
    publishedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    trendingTag: 'AIAgents',
    keyTakeaways: [
      'Multi-agent reasoning models demonstrated 3x speedup on complex repository benchmarks.',
      'Industry leaders convene in San Francisco to discuss safety guardrails and autonomous capability.',
      'Developers report widespread adoption of autonomous workflow assistants.',
    ],
    relatedTags: ['AIAgents', 'TechTrends', 'SoftwareEngineering', 'SiliconValley'],
  },
  {
    id: 'news-2',
    category: 'science',
    categoryLabel: 'Science & Space',
    isLive: true,
    headline: 'James Webb Space Telescope Unveils Deep Atmospheric Profile of Habitable-Zone Exoplanet',
    summary: 'Spectroscopy readings confirm carbon dioxide and methane in the atmosphere of K2-18b, providing new clues in the search for biosignatures beyond our solar system.',
    source: 'Astrophysics Daily',
    sourceLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=60&q=80',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    postCount: 48900,
    publishedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    trendingTag: 'JWST',
    keyTakeaways: [
      'JWST NIRSpec instrument detected strong signatures of carbon-bearing molecules.',
      'Planet orbits a cool red dwarf star 120 light-years away in constellation Leo.',
      'International astronomical coalition calls findings a watershed moment for exoplanet science.',
    ],
    relatedTags: ['JWST', 'SpaceDiscovery', 'Astronomy', 'Exoplanets'],
  },
  {
    id: 'news-3',
    category: 'news',
    categoryLabel: 'World News',
    isLive: true,
    headline: 'Historic Global Clean Energy Summit Ratifies 2030 Grid Modernization Pact',
    summary: 'Envoys from 48 nations commit $420 billion toward decentralized green super-grids, next-generation battery storage, and high-voltage transmission lines.',
    source: 'International Tribune',
    sourceLogo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=60&q=80',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    postCount: 91400,
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    trendingTag: 'CleanEnergyPact',
    keyTakeaways: [
      'Pact sets legal framework for cross-border renewable grid interconnectivity.',
      'Investment commitments focus on solid-state energy storage and smart distribution.',
      'Major industrial economies target 70% clean generation mix before 2030.',
    ],
    relatedTags: ['CleanEnergyPact', 'WorldNews', 'ClimateAction', 'FutureTech'],
  },
  {
    id: 'news-4',
    category: 'sports',
    categoryLabel: 'Sports · LIVE',
    isLive: true,
    headline: 'Champions League Quarterfinal Draw Produces Blockbuster Rematch in Madrid',
    summary: 'The stage is set for a dramatic European showdown as reigning champions collide under the lights, stirring intense global excitement among football fans.',
    source: 'Global Sports Network',
    sourceLogo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=60&q=80',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    postCount: 135800,
    publishedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    trendingTag: 'UCLDraw',
    keyTakeaways: [
      'Quarterfinal first legs scheduled for mid-April in high-stakes knockouts.',
      'Tactical showdowns feature the world’s top attacking tridents.',
      'Ticket demand surges past record numbers within minutes of the draw announcement.',
    ],
    relatedTags: ['UCLDraw', 'ChampionsLeague', 'Football', 'Madrid'],
  },
  {
    id: 'news-5',
    category: 'entertainment',
    categoryLabel: 'Entertainment',
    isLive: false,
    headline: 'Acclaimed Director Teases Mind-Bending Sci-Fi Epic Shot Entirely in IMAX 70mm',
    summary: 'Original footage revealed at international festival receives a standing ovation, previewing an interstellar voyage exploring the nature of human memory.',
    source: 'Cinema Chronicle',
    sourceLogo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=60&q=80',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    postCount: 37400,
    publishedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    trendingTag: 'FilmFestival',
    keyTakeaways: [
      'Production utilized custom high-aperture 70mm film cameras for cosmic sequence captures.',
      'Early reviews praise the score composed with analog synthesizers and choral arrangements.',
      'Theatrical release confirmed for worldwide IMAX screens later this winter.',
    ],
    relatedTags: ['FilmFestival', 'SciFi', 'IMAX', 'Cinema'],
  },
  {
    id: 'news-6',
    category: 'technology',
    categoryLabel: 'Technology & Hardware',
    isLive: false,
    headline: 'Next-Gen Quantum Computing Chip Operates at Near Room Temperature in Breakthrough Trial',
    summary: 'Solid-state diamond defect processors maintain coherence without requiring cryogenic helium cooling, drastically lowering the cost barrier for quantum research.',
    source: 'Quantum Frontiers',
    sourceLogo: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=60&q=80',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    postCount: 29500,
    publishedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    trendingTag: 'QuantumMilestone',
    keyTakeaways: [
      'Novel nitrogen-vacancy center technology avoids liquid helium infrastructure.',
      '1,024 physical qubits achieved with high fault-tolerance threshold.',
      'Commercial availability for university labs anticipated by Q4.',
    ],
    relatedTags: ['QuantumMilestone', 'DeepTech', 'Physics', 'Hardware'],
  },
  {
    id: 'news-7',
    category: 'sports',
    categoryLabel: 'Formula 1',
    isLive: true,
    headline: 'Formula 1 Unveils Revolutionary 2026 Active Aero Regulations and 100% Sustainable Fuel Specs',
    summary: 'Radical chassis redesign with manual override boost mode promises closer wheel-to-wheel racing as teams reveal early wind-tunnel concept models.',
    source: 'Paddock Insider',
    sourceLogo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=60&q=80',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    postCount: 52100,
    publishedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    trendingTag: 'F12026',
    keyTakeaways: [
      'Cars will feature dynamic straight-line drag reduction and cornering high-downforce modes.',
      'Power split is now 50% internal combustion and 50% high-capacity electrical energy recovery.',
      'Drivers praise simulator runs indicating increased overtaking opportunities.',
    ],
    relatedTags: ['F12026', 'Motorsport', 'Racing', 'Engineering'],
  },
];

// @desc    Get real-time news stream
// @route   GET /api/news
// @access  Public
export const getRealTimeNews = async (req, res) => {
  const { category = 'all', page = 1, limit = 10 } = req.query;

  let filtered = [...LIVE_NEWS_DATABASE];

  if (category && category !== 'all' && category !== 'trending') {
    filtered = filtered.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort: Live items first, then by publishedAt desc
  filtered.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  const startIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const paginated = filtered.slice(startIndex, startIndex + parseInt(limit, 10));

  res.status(200).json({
    success: true,
    news: paginated,
    total: filtered.length,
    timestamp: new Date().toISOString(),
  });
};

// @desc    Get top breaking live news story
// @route   GET /api/news/breaking
// @access  Public
export const getBreakingNews = async (req, res) => {
  const breaking = LIVE_NEWS_DATABASE.find((item) => item.isLive) || LIVE_NEWS_DATABASE[0];

  res.status(200).json({
    success: true,
    breaking,
    ticker: LIVE_NEWS_DATABASE.map((item) => ({
      id: item.id,
      headline: item.headline,
      category: item.categoryLabel,
      isLive: item.isLive,
      trendingTag: item.trendingTag,
    })),
  });
};

// @desc    Get specific news story by ID with discussion
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (req, res) => {
  const story = LIVE_NEWS_DATABASE.find((item) => item.id === req.params.id);

  if (!story) {
    return res.status(404).json({
      success: false,
      message: 'News story not found.',
    });
  }

  res.status(200).json({
    success: true,
    story,
  });
};

// @desc    Get What's Happening sidebar widget items
// @route   GET /api/news/whats-happening
// @access  Public
export const getWhatsHappening = async (req, res) => {
  const items = LIVE_NEWS_DATABASE.map((item) => ({
    id: item.id,
    category: item.categoryLabel,
    topic: item.headline,
    postCount: `${(item.postCount / 1000).toFixed(1)}K posts`,
    isLive: item.isLive,
    trendingTag: item.trendingTag,
    timeAgo: 'Trending',
  }));

  res.status(200).json({
    success: true,
    items,
  });
};
