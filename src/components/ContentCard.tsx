import { ContentItem } from "@/types/content";
import { Card } from "@/components/ui/card";

interface ContentCardProps {
  content: ContentItem;
  onClick: () => void;
  onDragStart: () => void;
}

export const ContentCard = ({ content, onClick, onDragStart }: ContentCardProps) => {
  const owner = content.owner;
  
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="content-card p-2 mb-1.5 cursor-move hover:shadow-medium transition-all duration-200 border-l-4 border-l-primary bg-card active:opacity-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-card-foreground truncate mb-0.5">
            {content.title}
          </h4>
          <p className="text-[10px] text-muted-foreground truncate">
            {content.channel}
          </p>
          {content.campaign && (
            <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-medium bg-accent/50 text-accent-foreground rounded">
              {content.campaign.name}
            </span>
          )}
        </div>
        {owner && (
          <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
            {owner.initials}
          </div>
        )}
      </div>
    </Card>
  );
};
