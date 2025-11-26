import { useState, useEffect } from "react";
import { TeamMember } from "@/types/content";
import { supabase } from "@/lib/supabase";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

const STORAGE_KEY = "cal_one_current_user";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setUsers(data);
        
        // Check for saved user
        const savedUserId = localStorage.getItem(STORAGE_KEY);
        if (savedUserId) {
          const user = data.find(m => m.id === savedUserId);
          if (user) setCurrentUser(user);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: TeamMember) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Landing users={users} onSelectUser={handleSelectUser} />;
  }

  return <Dashboard currentUser={currentUser} users={users} onLogout={handleLogout} />;
};

export default Index;
