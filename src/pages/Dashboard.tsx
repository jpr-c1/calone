import { useState } from "react";
import { TeamMember, ContentItem } from "@/types/content";
import { UserHeader } from "@/components/UserHeader";
import { AddContentDialog } from "@/components/AddContentDialog";
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
      
      <main className="container mx-auto px-6 py-8">
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
          <div className="grid gap-4">
            {contentItems.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-medium transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {item.channel}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Owner: </span>
                    <span className="text-card-foreground font-medium">{item.owner}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Publish: </span>
                    <span className="text-card-foreground font-medium">{item.publishDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
