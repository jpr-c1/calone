import { useState } from "react";
import { ContentItem } from "@/types/content";
import { ContentCard } from "@/components/ContentCard";
import { ContentDetailDialog } from "@/components/ContentDetailDialog";
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
}

export const CalendarGrid = ({ contentItems }: CalendarGridProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getContentForDay = (day: Date) => {
    return contentItems.filter(item => 
      isSameDay(new Date(item.publishDate), day)
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

  return (
    <>
      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-subtle border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
          {weekdays.map(day => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-semibold text-muted-foreground border-r border-border last:border-r-0"
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
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] border-r border-b border-border last:border-r-0 p-2 ${
                  isOtherMonth ? 'bg-muted/30' : 'bg-card'
                } ${index >= days.length - 7 ? 'border-b-0' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isOtherMonth ? 'text-muted-foreground/50' : 'text-foreground'
                }`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                  {dayContent.map(content => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onClick={() => handleContentClick(content)}
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
      />
    </>
  );
};
