import { TeamMember } from "@/types/content";
import { Card } from "@/components/ui/card";

interface TeamMemberCardProps {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
}

export const TeamMemberCard = ({ member, onSelect }: TeamMemberCardProps) => {
  return (
    <Card
      onClick={() => onSelect(member)}
      className="group cursor-pointer border-border/50 bg-card hover:border-primary/50 hover:bg-secondary/50 transition-all duration-150 p-6 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 mx-auto mb-4 flex items-center justify-center text-xl font-semibold text-primary group-hover:bg-primary/20 transition-colors duration-150">
        {member.initials}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-0.5">
        {member.name}
      </h3>
      <p className="text-xs text-muted-foreground">
        {member.role}
      </p>
    </Card>
  );
};
