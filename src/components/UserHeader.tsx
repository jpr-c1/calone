import { TeamMember } from "@/types/content";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserHeaderProps {
  currentUser: TeamMember;
  onLogout: () => void;
}

export const UserHeader = ({ currentUser, onLogout }: UserHeaderProps) => {
  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-white">C</span>
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            cal<span className="text-primary">.one</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-1">
            <p className="text-sm font-medium text-foreground leading-tight">{currentUser.name}</p>
            <p className="text-[11px] text-muted-foreground">{currentUser.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
            {currentUser.initials}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
