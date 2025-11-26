export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  channel: string;
  owner: string;
  publishDate: string;
  createdAt: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Eli Catesini', role: 'Content Director', initials: 'EC' },
  { id: '2', name: 'Jose Paz Rendal', role: 'Social Media Manager', initials: 'JPR' },
  { id: '3', name: 'Liz Rasmussen', role: 'Marketing Lead', initials: 'LR' },
  { id: '4', name: 'Rich Stevenson', role: 'Brand Strategist', initials: 'RS' },
  { id: '5', name: 'Val Muda', role: 'Content Producer', initials: 'VM' },
];

export const CHANNELS = [
  'Press',
  'Social LinkedIn',
  'CRM Email',
  'CRM In-App',
  'CRM Ads',
  'Website',
  'Blog',
  'Podcast',
  'Events Industry',
  'Events Own',
] as const;
