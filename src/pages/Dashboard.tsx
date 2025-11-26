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

        {contentItems.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center shadow-card">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">No content yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first content item
            </p>
            <AddContentDialog onAddContent={handleAddContent} />
          </div>
        ) : (
          <CalendarGrid contentItems={contentItems} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
