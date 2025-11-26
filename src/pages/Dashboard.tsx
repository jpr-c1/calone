import { useState, useEffect } from "react";
import { TeamMember, ContentItem } from "@/types/content";
import { supabase } from "@/lib/supabase";
import { UserHeader } from "@/components/UserHeader";
import { AddContentDialog } from "@/components/AddContentDialog";
import { CalendarGrid } from "@/components/CalendarGrid";
import { toast } from "sonner";

interface DashboardProps {
  currentUser: TeamMember;
  users: TeamMember[];
  onLogout: () => void;
}

const Dashboard = ({ currentUser, users, onLogout }: DashboardProps) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*, owner:users(*)');
      
      if (error) throw error;
      
      if (data) {
        const mappedContent = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          channel: item.channel,
          owner_id: item.owner_id,
          owner: Array.isArray(item.owner) ? item.owner[0] : item.owner,
          publish_date: item.publish_date,
          created_at: item.created_at,
          doc_url: item.doc_url
        }));
        setContentItems(mappedContent);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async (content: { title: string; description: string; channel: string; owner_id: string; publish_date: string; doc_url?: string }) => {
    try {
      const { data, error } = await supabase
        .from('content')
        .insert([content])
        .select('*, owner:users(*)')
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newContent: ContentItem = {
          id: data.id,
          title: data.title,
          description: data.description,
          channel: data.channel,
          owner_id: data.owner_id,
          owner: Array.isArray(data.owner) ? data.owner[0] : data.owner,
          publish_date: data.publish_date,
          created_at: data.created_at,
          doc_url: data.doc_url
        };
        setContentItems([...contentItems, newContent]);
        toast.success('Content added successfully!');
      }
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error('Failed to add content');
    }
  };

  const handleEditContent = async (id: string, updated: { title: string; description: string; channel: string; owner_id: string; publish_date: string }) => {
    try {
      const { data, error } = await supabase
        .from('content')
        .update(updated)
        .eq('id', id)
        .select('*, owner:users(*)')
        .single();
      
      if (error) throw error;
      
      if (data) {
        const updatedContent: ContentItem = {
          id: data.id,
          title: data.title,
          description: data.description,
          channel: data.channel,
          owner_id: data.owner_id,
          owner: Array.isArray(data.owner) ? data.owner[0] : data.owner,
          publish_date: data.publish_date,
          created_at: data.created_at,
          doc_url: data.doc_url
        };
        setContentItems(contentItems.map(item => 
          item.id === id ? updatedContent : item
        ));
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
      throw error;
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setContentItems(contentItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
      throw error;
    }
  };

  const handleRescheduleContent = async (id: string, newDate: string) => {
    try {
      const { data, error } = await supabase
        .from('content')
        .update({ publish_date: newDate })
        .eq('id', id)
        .select('*, owner:users(*)')
        .single();
      
      if (error) throw error;
      
      if (data) {
        const updatedContent: ContentItem = {
          id: data.id,
          title: data.title,
          description: data.description,
          channel: data.channel,
          owner_id: data.owner_id,
          owner: Array.isArray(data.owner) ? data.owner[0] : data.owner,
          publish_date: data.publish_date,
          created_at: data.created_at,
          doc_url: data.doc_url
        };
        setContentItems(contentItems.map(item => 
          item.id === id ? updatedContent : item
        ));
        toast.success('Content rescheduled');
      }
    } catch (error) {
      console.error('Error rescheduling content:', error);
      toast.error('Failed to reschedule content');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <UserHeader currentUser={currentUser} onLogout={onLogout} />
        <main className="container mx-auto px-6 py-8 max-w-7xl flex items-center justify-center">
          <p className="text-muted-foreground">Loading content...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <UserHeader currentUser={currentUser} onLogout={onLogout} />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Content Calendar</h2>
            <p className="text-muted-foreground">Manage your marketing content schedule</p>
          </div>
          <AddContentDialog users={users} onAddContent={handleAddContent} />
        </div>

        <CalendarGrid 
          contentItems={contentItems}
          users={users}
          onEditContent={handleEditContent}
          onDeleteContent={handleDeleteContent}
          onRescheduleContent={handleRescheduleContent}
          onAddContent={handleAddContent}
        />
      </main>
    </div>
  );
};

export default Dashboard;
