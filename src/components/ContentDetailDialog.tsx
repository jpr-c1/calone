import { ContentItem, TEAM_MEMBERS } from "@/types/content";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ContentDetailDialogProps {
  content: ContentItem | null;
  open: boolean;
  onClose: () => void;
}

export const ContentDetailDialog = ({ content, open, onClose }: ContentDetailDialogProps) => {
  if (!content) return null;

  const owner = TEAM_MEMBERS.find(m => m.name === content.owner);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-card-foreground pr-8">
            {content.title}
          </DialogTitle>
        </DialogHeader>
        
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
                {format(new Date(content.publishDate), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Content Owner
            </label>
            <div className="flex items-center gap-3">
              {owner && (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-soft">
                    {owner.initials}
                  </div>
                  <div>
                    <p className="text-card-foreground font-medium">{owner.name}</p>
                    <p className="text-sm text-muted-foreground">{owner.role}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
