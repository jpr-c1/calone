import { useState, useEffect } from "react";
import { TeamMember, TEAM_MEMBERS } from "@/types/content";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

const STORAGE_KEY = "cal_one_current_user";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      const user = TEAM_MEMBERS.find(m => m.id === savedUser);
      if (user) setCurrentUser(user);
    }
  }, []);

  const handleSelectUser = (user: TeamMember) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!currentUser) {
    return <Landing onSelectUser={handleSelectUser} />;
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
};

export default Index;
