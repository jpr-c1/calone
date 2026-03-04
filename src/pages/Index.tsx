import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeamMember } from "@/types/content";
import { supabase } from "@/lib/supabase";
import Dashboard from "./Dashboard";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (!session) {
        navigate("/auth");
        return;
      }

      // Load current user from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("google_id", session.user.id)
        .single();

      if (userError) throw userError;

      if (userData) {
        setCurrentUser(userData);
        loadAllUsers();
      }
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name");
      
      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <Dashboard currentUser={currentUser} users={users} onLogout={handleLogout} />;
};

export default Index;
