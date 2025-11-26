import { TeamMember, TEAM_MEMBERS } from "@/types/content";
import { TeamMemberCard } from "@/components/TeamMemberCard";

interface LandingProps {
  onSelectUser: (user: TeamMember) => void;
}

const Landing = ({ onSelectUser }: LandingProps) => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            cal.one
          </h1>
          <p className="text-xl text-muted-foreground">
            Select your profile to continue
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM_MEMBERS.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onSelect={onSelectUser}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
