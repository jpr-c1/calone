import { ContentItem } from "@/types/content";
import { Card } from "@/components/ui/card";

interface ContentCardProps {
  content: ContentItem;
  onClick: () => void;
  onDragStart: () => void;
}

const getChannelColor = (channel: string): string => {
  if (channel.startsWith("CRM")) return "#F27A2E";
  if (channel.startsWith("Social")) return "#3B82F6";
  if (channel === "Blog" || channel === "Website") return "#8B5CF6";
  if (channel === "Press") return "#6B7280";
  if (channel.startsWith("Events")) return "#10B981";
  if (channel === "Podcast") return "#EC4899";
  return "#6B7280";
};

export const ContentCard = ({ content, onClick, onDragStart }: ContentCardProps) => {
  const owner = content.owner;
  const channelColor = getChannelColor(content.channel);

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="content-card p-1.5 mb-1 cursor-move hover:brightness-125 transition-all duration-150 border-l-[3px] bg-secondary/80 hover:bg-secondary border-t-0 border-r-0 border-b-0 rounded-sm shadow-none"
      style={{ borderLeftColor: channelColor }}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-medium text-foreground truncate leading-tight">
            {content.title}
          </h4>
          <p className="text-[9px] text-muted-foreground truncate mt-0.5">
            {content.channel}
          </p>
          {content.campaign && (
            <span className="inline-block mt-0.5 px-1 py-[1px] text-[8px] font-medium bg-primary/10 text-primary rounded-sm">
              {content.campaign.name}
            </span>
          )}
        </div>
        {owner && (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-semibold text-muted-foreground flex-shrink-0">
            {owner.initials}
          </div>
        )}
      </div>
    </Card>
  );
};
