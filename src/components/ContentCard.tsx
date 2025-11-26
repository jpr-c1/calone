import { ContentItem, TEAM_MEMBERS } from "@/types/content";
import { Card } from "@/components/ui/card";

interface ContentCardProps {
  content: ContentItem;
  onClick: () => void;
}

export const ContentCard = ({ content, onClick }: ContentCardProps) => {
  const owner = TEAM_MEMBERS.find(m => m.name === content.owner);
  
  return (
    <Card
      onClick={onClick}
      className="p-2 mb-1.5 cursor-pointer hover:shadow-medium transition-all duration-200 border-l-4 border-l-primary bg-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-card-foreground truncate mb-0.5">
            {content.title}
          </h4>
          <p className="text-[10px] text-muted-foreground truncate">
            {content.channel}
          </p>
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
