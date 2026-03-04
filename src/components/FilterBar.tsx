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
    <div className="bg-card/50 border border-border/40 rounded-lg p-3 mb-4">
      <div className="flex items-end gap-3 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-[2] min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search content..."
            className="pl-9 h-9 text-sm border-border/50 bg-input focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Filter Dropdowns - inline */}
        <div className="flex-1 min-w-[150px]">
          <Label className="text-[11px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">
            Channel
          </Label>
          <Select value={selectedChannel} onValueChange={onChannelChange}>
            <SelectTrigger className="h-9 text-sm border-border/50 bg-input">
              <SelectValue placeholder="All" />
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

        <div className="flex-1 min-w-[150px]">
          <Label className="text-[11px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">
            Owner
          </Label>
          <Select value={selectedOwner} onValueChange={onOwnerChange}>
            <SelectTrigger className="h-9 text-sm border-border/50 bg-input">
              <SelectValue placeholder="All" />
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

        <div className="flex-1 min-w-[150px]">
          <Label className="text-[11px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">
            Campaign
          </Label>
          <Select value={selectedCampaign} onValueChange={onCampaignChange}>
            <SelectTrigger className="h-9 text-sm border-border/50 bg-input">
              <SelectValue placeholder="All" />
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
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
