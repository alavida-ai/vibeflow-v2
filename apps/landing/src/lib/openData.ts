// Centralized manual data for the Build in Open page

export interface CampaignHeaderData {
  title: string;
  subtitle: string;
  goal: string;
  target: string;
}

export const campaignHeaderData: CampaignHeaderData = {
  title: '🚀 Alavida × Vibeflow SF Campaign 2025',
  subtitle: '8-Week Build-in-Public Go-to-Market Strategy',
  goal: 'Transform from unknown to obvious choice for engineering-led agencies',
  target: '2-3 signed partnerships • 888 new followers • $50K+ pipeline',
};

export interface MetricCard {
  title: string;
  value: string;
  delta: string; // include +/- signs for color
}

export interface DashboardData {
  week: number;
  totalWeeks: number;
  overallProgressPercent: number; // 0-100
  cards: MetricCard[];
}

export const dashboardData: DashboardData = {
  week: 1,
  totalWeeks: 8,
  overallProgressPercent: 23,
  cards: [
    { title: 'Twitter Growth', value: '234/1,000 followers', delta: '+122 this week' },
    { title: 'GitHub Momentum', value: '12/20 stars', delta: '+8 this week' },
    { title: 'Agency Pipeline', value: '3/10 qualified prospects', delta: '+1 this week' },
    { title: 'Revenue Pipeline', value: '$15K/$50K identified', delta: '+$5K this week' },
  ],
};

export type ActivityLevel = 'high' | 'medium' | 'none';

// Simplified manual activity grid: 4 weeks × 7 days
export const activityWeeks: ActivityLevel[][] = [
  ['high', 'high', 'none', 'medium', 'medium', 'none', 'none'],
  ['high', 'high', 'high', 'none', 'medium', 'medium', 'none'],
  ['high', 'none', 'high', 'high', 'high', 'high', 'high'],
  ['none', 'high', 'high', 'high', 'none', 'high', 'high'],
];

export interface PhaseItem { label: string; done: boolean }
export interface Phase {
  id: string;
  title: string;
  status: 'complete' | 'in_progress' | 'upcoming';
  items: PhaseItem[];
}

export const phases: Phase[] = [
  {
    id: 'p1',
    title: 'Phase 1: Technical Credibility (Weeks 1-2)',
    status: 'complete',
    items: [
      { label: 'noncitizen.io case study published', done: true },
      { label: 'Component demos with screenshots', done: true },
      { label: '"NextJS for marketing" positioning', done: true },
      { label: '25+ new followers milestone', done: true },
    ],
  },
  {
    id: 'p2',
    title: 'Phase 2: Authority Building (Weeks 3-4)',
    status: 'in_progress',
    items: [
      { label: 'Add Alexander Garcia Chicote to team', done: false },
      { label: 'Weekly component releases', done: false },
      { label: 'Expert engagement in communities', done: false },
      { label: '150+ new followers milestone', done: false },
    ],
  },
  {
    id: 'p3',
    title: 'Phase 3: Agency Focus (Weeks 5-6)',
    status: 'upcoming',
    items: [
      { label: 'Direct agency outreach campaign', done: false },
      { label: 'ROI case studies content', done: false },
      { label: 'Partnership pipeline development', done: false },
      { label: '5+ agency prospects milestone', done: false },
    ],
  },
  {
    id: 'p4',
    title: 'Phase 4: SF Preparation (Weeks 7-8)',
    status: 'upcoming',
    items: [
      { label: 'SF meeting confirmations', done: false },
      { label: 'Technical capability showcase', done: false },
      { label: 'Final campaign metrics', done: false },
      { label: '2-3 partnerships signed', done: false },
    ],
  },
];

export interface FeedItem {
  title: string;
  platform: string;
  ago: string;
  metrics: string;
  url: string;
}

export const feedItems: FeedItem[] = [
  {
    title: '"Demo screenshots + technical explanation"',
    platform: 'Twitter',
    ago: '2 days ago',
    metrics: '1,674 impressions • 23 engagements • 3 replies',
    url: '#',
  },
  {
    title: '"NextJS for marketing positioning"',
    platform: 'Twitter',
    ago: '4 days ago',
    metrics: '1,234 impressions • 18 engagements • 5 replies',
    url: '#',
  },
];

export const methodology = {
  intro: 'Complete transparency demonstrates:',
  bullets: [
    'Technical competence through consistent execution',
    'Strategic thinking through documented process',
    'Community building through shared knowledge',
    'Authenticity through real metrics (good and bad)',
  ],
  outro:
    'This approach builds trust with engineering-led agencies who value transparency and systematic approaches to marketing.',
};


