import { TeamMember, Campaign, CHANNELS } from "@/types/content";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FilterBarProps {
  users: TeamMember[];
  campaigns: Campaign[];
  selectedChannel: string;
  selectedOwner: string;
  selectedCampaign: string;
  searchQuery: string;
  onChannelChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export const FilterBar = ({
  users,
  campaigns,
  selectedChannel,
  selectedOwner,
  selectedCampaign,
  searchQuery,
  onChannelChange,
  onOwnerChange,
  onCampaignChange,
  onSearchChange,
  onClearFilters,
}: FilterBarProps) => {
  const hasActiveFilters = selectedChannel || selectedOwner || selectedCampaign || searchQuery;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-card">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search content by title or description..."
            className="pl-10 border-input bg-background"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Channel
            </Label>
            <Select value={selectedChannel} onValueChange={onChannelChange}>
              <SelectTrigger className="border-input bg-background">
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-[100]">
                <SelectItem value="all">All channels</SelectItem>
                {CHANNELS.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Owner
            </Label>
            <Select value={selectedOwner} onValueChange={onOwnerChange}>
              <SelectTrigger className="border-input bg-background">
                <SelectValue placeholder="All owners" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-[100]">
                <SelectItem value="all">All owners</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Campaign
            </Label>
            <Select value={selectedCampaign} onValueChange={onCampaignChange}>
              <SelectTrigger className="border-input bg-background">
                <SelectValue placeholder="All campaigns" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-[100]">
                <SelectItem value="all">All campaigns</SelectItem>
                <SelectItem value="none">No campaign</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
