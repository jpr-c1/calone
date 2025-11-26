import { useState } from "react";
import { TeamMember, ContentItem } from "@/types/content";
import { UserHeader } from "@/components/UserHeader";
import { AddContentDialog } from "@/components/AddContentDialog";
import { CalendarGrid } from "@/components/CalendarGrid";
import { Calendar } from "lucide-react";

interface DashboardProps {
  currentUser: TeamMember;
  onLogout: () => void;
}

const Dashboard = ({ currentUser, onLogout }: DashboardProps) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  const handleAddContent = (content: Omit<ContentItem, "id" | "createdAt">) => {
    const newContent: ContentItem = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setContentItems([...contentItems, newContent]);
  };

  const handleEditContent = (id: string, updated: Omit<ContentItem, "id" | "createdAt">) => {
    setContentItems(contentItems.map(item => 
      item.id === id 
        ? { ...item, ...updated }
        : item
    ));
  };

  const handleDeleteContent = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <UserHeader currentUser={currentUser} onLogout={onLogout} />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Content Calendar</h2>
            <p className="text-muted-foreground">Manage your marketing content schedule</p>
          </div>
          <AddContentDialog onAddContent={handleAddContent} />
        </div>

        <CalendarGrid 
          contentItems={contentItems} 
          onEditContent={handleEditContent}
          onDeleteContent={handleDeleteContent}
        />
      </main>
    </div>
  );
};

export default Dashboard;
