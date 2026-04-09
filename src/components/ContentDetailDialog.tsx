import { useState } from "react";
import { ContentItem, TeamMember, CHANNELS, Campaign } from "@/types/content";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit, Trash2, ExternalLink, Plus, Copy, Clipboard } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ContentDetailDialogProps {
  content: ContentItem | null;
  open: boolean;
  onClose: () => void;
  users: TeamMember[];
  campaigns: Campaign[];
  onEdit: (id: string, updated: { title: string; description: string; channel: string; owner_id: string; publish_date: string; campaign_id?: string; published_url?: string }) => void;
  onDelete: (id: string) => void;
  onAddCampaign: () => void;
  onCopy?: (content: ContentItem) => void;
}

export const ContentDetailDialog = ({ content, open, onClose, users, campaigns, onEdit, onDelete, onAddCampaign, onCopy }: ContentDetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [newCampaignName, setNewCampaignName] = useState("");
  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [publishDate, setPublishDate] = useState<Date>();
  const [publishedUrl, setPublishedUrl] = useState("");
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  if (!content) return null;

  const ownerData = content.owner;

  const handleAddNewCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{ name: newCampaignName.trim() }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCampaignId(data.id);
        setNewCampaignName("");
        setIsAddingCampaign(false);
        toast.success("Campaign created successfully!");
        onAddCampaign();
      }
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      if (error.code === '23505') {
        toast.error("A campaign with this name already exists");
      } else {
        toast.error("Failed to create campaign");
      }
    }
  };

  const handleEditClick = () => {
    setTitle(content.title);
    setDescription(content.description);
    setChannel(content.channel);
    setOwnerId(content.owner_id);
    setCampaignId(content.campaign_id || "");
    setPublishDate(new Date(content.publish_date));
    setPublishedUrl(content.published_url || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!title || !description || !channel || !ownerId || !publishDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await onEdit(content.id, {
        title,
        description,
        channel,
        owner_id: ownerId,
        publish_date: format(publishDate, "yyyy-MM-dd"),
        campaign_id: campaignId || undefined,
        published_url: publishedUrl || undefined,
      });

      setIsEditing(false);
      setIsEditingUrl(false);
      toast.success("Content updated successfully!");
    } catch (error) {
      // Error already handled in Dashboard
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(content.id);
    setDeleteDialogOpen(false);
    onClose();
    toast.success("Content deleted successfully!");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose} modal={false}>
        <DialogContent 
          className="sm:max-w-[600px] bg-card border-border"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-card-foreground pr-8">
              {isEditing ? "Edit Content" : content.title}
            </DialogTitle>
          </DialogHeader>
          
          {isEditing ? (
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-card-foreground">Title *</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter content title"
                  required
                  className="border-input bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-card-foreground">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter content description"
                  required
                  rows={4}
                  className="border-input bg-background resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-channel" className="text-card-foreground">Channel *</Label>
                  <Select value={channel} onValueChange={setChannel} required>
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-[100]">
                      {CHANNELS.map((ch) => (
                        <SelectItem key={ch} value={ch}>
                          {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-owner" className="text-card-foreground">Owner *</Label>
                  <Select value={ownerId} onValueChange={setOwnerId} required>
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-[100]">
                      {users.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-campaign" className="text-card-foreground">Campaign (Optional)</Label>
                {!isAddingCampaign ? (
                  <div className="flex gap-2">
                    <Select value={campaignId || "__none__"} onValueChange={(val) => setCampaignId(val === "__none__" ? "" : val)}>
                      <SelectTrigger className="flex-1 border-input bg-background">
                        <SelectValue placeholder="Select campaign" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-[100]">
                        <SelectItem value="__none__">None</SelectItem>
                        {campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsAddingCampaign(true)}
                      className="flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="Enter new campaign name"
                      className="flex-1 border-input bg-background"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCampaign();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewCampaign}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingCampaign(false);
                        setNewCampaignName("");
                      }}
                      className="flex-shrink-0"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground">Publish Date *</Label>
              <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-input bg-background",
                        !publishDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 bg-popover border-border z-[100]" 
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <Calendar
                      mode="single"
                      selected={publishDate}
                      onSelect={setPublishDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-published-url" className="text-card-foreground">Published URL</Label>
                <Input
                  id="edit-published-url"
                  type="url"
                  value={publishedUrl}
                  onChange={(e) => setPublishedUrl(e.target.value)}
                  placeholder="https://example.com/published-content"
                  className="border-input bg-background"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 mt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Description
                </label>
                <p className="text-card-foreground leading-relaxed">
                  {content.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Channel
                  </label>
                  <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                    {content.channel}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Publish Date
                  </label>
                  <p className="text-card-foreground font-medium">
                    {format(new Date(content.publish_date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Content Owner
                </label>
                <div className="flex items-center gap-3">
                  {ownerData && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-soft">
                        {ownerData.initials}
                      </div>
                      <div>
                        <p className="text-card-foreground font-medium">{ownerData.name}</p>
                        <p className="text-sm text-muted-foreground">{ownerData.role}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {content.campaign && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Campaign
                  </label>
                  <Badge className="bg-accent/50 text-accent-foreground border border-accent/30 hover:bg-accent/60">
                    {content.campaign.name}
                  </Badge>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Brief Prompt
                </label>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const text = `I'm writing ${content.title} for ${content.channel}. Here's a short description to help you get started: "${content.description}"`;
                    await navigator.clipboard.writeText(text);
                    toast.success("Copied to clipboard!");
                  }}
                  className="hover:bg-primary/10 hover:border-primary"
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copy Brief to Clipboard
                </Button>
              </div>

              {content.doc_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Content Brief
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => window.open(content.doc_url!, '_blank')}
                    className="hover:bg-primary/10 hover:border-primary"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Brief in Google Docs
                  </Button>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Published URL
                </label>
                {!content.published_url && !isEditingUrl ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPublishedUrl("");
                      setIsEditingUrl(true);
                    }}
                    className="w-full justify-start text-muted-foreground hover:bg-primary/10 hover:border-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Published URL
                  </Button>
                ) : isEditingUrl ? (
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={publishedUrl}
                      onChange={(e) => setPublishedUrl(e.target.value)}
                      placeholder="https://example.com/published-content"
                      className="flex-1 border-input bg-background"
                    />
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await onEdit(content.id, {
                            title: content.title,
                            description: content.description,
                            channel: content.channel,
                            owner_id: content.owner_id,
                            publish_date: content.publish_date,
                            campaign_id: content.campaign_id,
                            published_url: publishedUrl || undefined,
                          });
                          setIsEditingUrl(false);
                          toast.success("Published URL updated!");
                        } catch (error) {
                          toast.error("Failed to update URL");
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPublishedUrl(content.published_url || "");
                        setIsEditingUrl(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(content.published_url!, '_blank')}
                      className="flex-1 justify-start hover:bg-primary/10 hover:border-primary"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {content.published_url}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setPublishedUrl(content.published_url || "");
                        setIsEditingUrl(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditClick}
                  className="flex-1 hover:bg-primary/10 hover:border-primary"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {onCopy && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onCopy(content);
                      onClose();
                    }}
                    className="flex-1 hover:bg-primary/10 hover:border-primary"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteClick}
                  className="flex-1 hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">Delete Content</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{content.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
