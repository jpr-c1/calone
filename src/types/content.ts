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
  owner_id: string;
  owner?: TeamMember;
  publish_date: string;
  created_at: string;
}

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
