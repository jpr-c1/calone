import { useState } from "react";
import { ContentItem, TeamMember, CHANNELS } from "@/types/content";
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
import { CalendarIcon, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ContentDetailDialogProps {
  content: ContentItem | null;
  open: boolean;
  onClose: () => void;
  users: TeamMember[];
  onEdit: (id: string, updated: { title: string; description: string; channel: string; owner_id: string; publish_date: string }) => void;
  onDelete: (id: string) => void;
}

export const ContentDetailDialog = ({ content, open, onClose, users, onEdit, onDelete }: ContentDetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [publishDate, setPublishDate] = useState<Date>();

  if (!content) return null;

  const ownerData = content.owner;

  const handleEditClick = () => {
    setTitle(content.title);
    setDescription(content.description);
    setChannel(content.channel);
    setOwnerId(content.owner_id);
    setPublishDate(new Date(content.publish_date));
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
      });

      setIsEditing(false);
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
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border">
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
                  <Label htmlFor="edit-owner" className="text-card-foreground">Owner *</Label>
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
                <Label className="text-card-foreground">Publish Date *</Label>
                <Popover>
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
