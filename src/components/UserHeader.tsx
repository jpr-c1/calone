import { TeamMember } from "@/types/content";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserHeaderProps {
  currentUser: TeamMember;
  onLogout: () => void;
}

export const UserHeader = ({ currentUser, onLogout }: UserHeaderProps) => {
  return (
    <header className="border-b border-border bg-card shadow-soft">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            cal.one
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <p className="text-sm font-medium text-card-foreground">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-soft">
            {currentUser.initials}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
