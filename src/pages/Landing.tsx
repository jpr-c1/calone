import { TeamMember } from "@/types/content";
import { TeamMemberCard } from "@/components/TeamMemberCard";

interface LandingProps {
  users: TeamMember[];
  onSelectUser: (user: TeamMember) => void;
}

const Landing = ({ users, onSelectUser }: LandingProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-foreground tracking-tight">
            cal<span className="text-primary">.one</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Select your profile to continue
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((member) => (
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
