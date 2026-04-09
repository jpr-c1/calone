import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/content";
import { Archive, ArchiveRestore, Settings2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CampaignManagerDialogProps {
  campaigns: Campaign[];
  onUpdate: () => void;
}

export const CampaignManagerDialog = ({ campaigns, onUpdate }: CampaignManagerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activeCampaigns = campaigns.filter(c => !c.archived);
  const archivedCampaigns = campaigns.filter(c => c.archived);

  const handleToggleArchive = async (campaign: Campaign) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ archived: !campaign.archived })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success(campaign.archived ? `"${campaign.name}" restored` : `"${campaign.name}" archived`);
      onUpdate();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error("Failed to update campaign");
    }
  };

  const displayedCampaigns = showArchived ? archivedCampaigns : activeCampaigns;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary">
          <Settings2 className="h-4 w-4 mr-2" />
          Manage Campaigns
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-card-foreground">Manage Campaigns</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <Button
            variant={!showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(false)}
            className={cn(!showArchived && "bg-gradient-primary")}
          >
            Active ({activeCampaigns.length})
          </Button>
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(true)}
            className={cn(showArchived && "bg-gradient-primary")}
          >
            Archived ({archivedCampaigns.length})
          </Button>
        </div>

        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
          {displayedCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {showArchived ? "No archived campaigns" : "No active campaigns"}
            </p>
          ) : (
            displayedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
              >
                <span className="text-sm font-medium text-card-foreground">{campaign.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleArchive(campaign)}
                  className={cn(
                    "text-muted-foreground",
                    campaign.archived
                      ? "hover:text-primary hover:bg-primary/10"
                      : "hover:text-destructive hover:bg-destructive/10"
                  )}
                >
                  {campaign.archived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-1" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
