import { useState } from "react";
import { ContentItem, TeamMember, Campaign } from "@/types/content";
import { ContentCard } from "@/components/ContentCard";
import { ContentDetailDialog } from "@/components/ContentDetailDialog";
import { AddContentDialog } from "@/components/AddContentDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";

interface CalendarGridProps {
  contentItems: ContentItem[];
  users: TeamMember[];
  campaigns: Campaign[];
  onEditContent: (id: string, updated: { title: string; description: string; channel: string; owner_id: string; publish_date: string; campaign_id?: string }) => void;
  onDeleteContent: (id: string) => void;
  onRescheduleContent: (id: string, newDate: string) => void;
  onAddContent: (content: { title: string; description: string; channel: string; owner_id: string; publish_date: string; doc_url?: string; campaign_id?: string }) => void;
  onAddCampaign: () => void;
}

export const CalendarGrid = ({ contentItems, users, campaigns, onEditContent, onDeleteContent, onRescheduleContent, onAddContent, onAddCampaign }: CalendarGridProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedContent, setDraggedContent] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getContentForDay = (day: Date) => {
    return contentItems.filter(item => 
      isSameDay(new Date(item.publish_date), day)
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleContentClick = (content: ContentItem) => {
    setSelectedContent(content);
    setDetailOpen(true);
  };

  const isCurrentMonth = (day: Date) => {
    return format(day, 'MM') === format(currentMonth, 'MM');
  };

  const handleCellClick = (day: Date, event: React.MouseEvent) => {
    // Only open add dialog if clicking on empty space (not on a card)
    if ((event.target as HTMLElement).closest('.content-card')) {
      return;
    }
    setSelectedDate(day);
    setAddDialogOpen(true);
  };

  const handleDragStart = (contentId: string) => {
    setDraggedContent(contentId);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (day: Date) => {
    if (draggedContent) {
      const newDate = format(day, 'yyyy-MM-dd');
      onRescheduleContent(draggedContent, newDate);
      setDraggedContent(null);
    }
  };

  const handleAddContentSubmit = (content: { title: string; description: string; channel: string; owner_id: string; publish_date: string; doc_url?: string; campaign_id?: string }) => {
    onAddContent(content);
    setAddDialogOpen(false);
    setSelectedDate(null);
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
  };

  return (
    <>
      <div className="bg-card border border-border/60 rounded-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="border-b border-border/60 px-5 py-3 flex items-center justify-between bg-secondary/30">
          <h3 className="text-xl font-semibold text-foreground tracking-tight">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
          {weekdays.map(day => (
            <div
              key={day}
              className="px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/40 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayContent = getContentForDay(day);
            const isOtherMonth = !isCurrentMonth(day);
            const todayHighlight = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={(e) => handleCellClick(day, e)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(day)}
                className={`min-h-[110px] border-r border-b border-border/40 last:border-r-0 p-1.5 cursor-pointer transition-colors duration-100 ${
                  isOtherMonth ? 'bg-background/60' : 'bg-card hover:bg-secondary/20'
                } ${index >= days.length - 7 ? 'border-b-0' : ''}`}
              >
                <div className={`text-[11px] font-medium mb-1 flex items-center ${
                  isOtherMonth ? 'text-muted-foreground/40' : todayHighlight ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}>
                  {todayHighlight ? (
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                      {format(day, "d")}
                    </span>
                  ) : (
                    format(day, "d")
                  )}
                </div>
                <div className="space-y-0.5 max-h-[80px] overflow-y-auto">
                  {dayContent.map(content => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onClick={() => handleContentClick(content)}
                      onDragStart={() => handleDragStart(content.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ContentDetailDialog
        content={selectedContent}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        users={users}
        campaigns={campaigns}
        onEdit={onEditContent}
        onDelete={onDeleteContent}
        onAddCampaign={onAddCampaign}
      />

      <AddContentDialog 
        users={users}
        campaigns={campaigns}
        onAddContent={handleAddContentSubmit}
        onAddCampaign={onAddCampaign}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        initialDate={selectedDate}
      />
    </>
  );
};
