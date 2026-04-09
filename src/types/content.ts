export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  email: string;
  google_id: string;
}

export interface Campaign {
  id: string;
  name: string;
  created_at: string;
  archived: boolean;
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
  doc_url?: string;
  campaign_id?: string;
  campaign?: Campaign;
  published_url?: string;
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
