import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CHANNELS, TeamMember, Campaign } from "@/types/content";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AddContentDialogProps {
  users: TeamMember[];
  campaigns: Campaign[];
  onAddContent: (content: { title: string; description: string; channel: string; owner_id: string; publish_date: string; doc_url?: string; campaign_id?: string }) => void;
  onAddCampaign: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialDate?: Date | null;
}

export const AddContentDialog = ({ users, campaigns, onAddContent, onAddCampaign, open: controlledOpen, onOpenChange, initialDate }: AddContentDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [newCampaignName, setNewCampaignName] = useState("");
  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [publishDate, setPublishDate] = useState<Date>();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Set initial date when dialog opens
  useEffect(() => {
    if (open && initialDate) {
      setPublishDate(initialDate);
    }
  }, [open, initialDate]);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !channel || !ownerId || !publishDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);

    try {
      // Get current session to access Google OAuth token
      const { data: { session } } = await supabase.auth.getSession();
      
      let docUrl = null;

      // Get owner name
      const owner = users.find(u => u.id === ownerId);
      const ownerName = owner?.name || "Unknown";

      // Try to get refresh token from user record if provider_token is missing
      let refreshToken = null;
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('google_refresh_token')
          .eq('google_id', session.user.id)
          .single();
        refreshToken = userData?.google_refresh_token;
      }

      // Create Google Doc
      try {
        console.log('Calling create-google-doc edge function');
        const response = await fetch(`https://ryqoqrxtxucgshdbkvvo.supabase.co/functions/v1/create-google-doc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            title,
            description,
            channel,
            ownerName,
            publishDate: format(publishDate, "MMMM d, yyyy"),
            accessToken: session?.provider_token || null,
            refreshToken,
            campaignName: campaignId ? campaigns.find(c => c.id === campaignId)?.name : null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          docUrl = data.docUrl;
          toast.success("Content and Google Doc created successfully!");
        } else if (response.status === 401) {
          toast.warning("Google session expired. Please log out and log back in to create Google Docs.");
        } else {
          const errorText = await response.text().catch(() => "");
          console.error('Failed to create Google Doc:', response.status, errorText);
          toast.warning("Content created, but Google Doc creation failed.");
        }
      } catch (docError) {
        console.error('Error creating Google Doc:', docError);
        toast.warning("Content created, but Google Doc creation failed.");
      }

      const newContent = {
        title,
        description,
        channel,
        owner_id: ownerId,
        publish_date: format(publishDate, "yyyy-MM-dd"),
        doc_url: docUrl,
        campaign_id: campaignId || undefined,
      };

      onAddContent(newContent);
      
      // Reset form
      setTitle("");
      setDescription("");
      setChannel("");
      setOwnerId("");
      setCampaignId("");
      setPublishDate(undefined);
      setOpen(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("Failed to create content");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-card-foreground">Add New Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-card-foreground">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
              required
              className="border-input bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-card-foreground">Description *</Label>
            <Textarea
              id="description"
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
              <Label htmlFor="channel" className="text-card-foreground">Channel *</Label>
              <Select value={channel} onValueChange={setChannel} required>
                <SelectTrigger className="border-input bg-background">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {CHANNELS.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner" className="text-card-foreground">Owner *</Label>
              <Select value={ownerId} onValueChange={setOwnerId} required>
                <SelectTrigger className="border-input bg-background">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
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
            <Label htmlFor="campaign" className="text-card-foreground">Campaign (Optional)</Label>
            {!isAddingCampaign ? (
              <div className="flex gap-2">
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger className="flex-1 border-input bg-background">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[100]">
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
              <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:opacity-90"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Save Content"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
