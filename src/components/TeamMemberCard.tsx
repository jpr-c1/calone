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
      className="group cursor-pointer border-border bg-card hover:border-primary hover:shadow-medium transition-all duration-300 p-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-soft group-hover:scale-110 transition-transform duration-300">
        {member.initials}
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-1">
        {member.name}
      </h3>
      <p className="text-sm text-muted-foreground">
        {member.role}
      </p>
    </Card>
  );
};
