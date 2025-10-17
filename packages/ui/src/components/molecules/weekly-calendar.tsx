import * as React from 'react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatWeekRange(dates: Date[]): string {
  const first = dates[0];
  const last = dates[6];
  const firstMonth = first.toLocaleDateString('en-US', { month: 'short' });
  const lastMonth = last.toLocaleDateString('en-US', { month: 'short' });

  if (firstMonth === lastMonth) {
    return `${firstMonth} ${first.getDate()} - ${last.getDate()}, ${first.getFullYear()}`;
  }
  return `${firstMonth} ${first.getDate()} - ${lastMonth} ${last.getDate()}, ${first.getFullYear()}`;
}

export default function WeeklyCalendar() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const weekDates = getWeekDates(new Date(selectedDate));

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex-none border-b p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{formatWeekRange(weekDates)}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-auto justify-start text-left font-normal bg-white">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(selectedDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handlePreviousWeek} aria-label="Previous week">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday} className="px-4 bg-white">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextWeek} aria-label="Next week">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
          <div className="flex-1 overflow-auto">
            <div className="sticky top-0 z-20 grid grid-cols-8 border-b bg-gradient-to-b from-white from-70% to-transparent pb-4">
              <div className="sticky left-0 z-30 border-r bg-gradient-to-b from-white from-70% to-transparent p-3">
                <span className="text-sm font-medium text-muted-foreground">Time</span>
              </div>
              {weekDates.map((date, i) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={i} className="border-r p-3 last:border-r-0">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium text-muted-foreground">{dayName}</span>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                          }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="divide-y">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8">
                  <div className="sticky left-0 z-10 border-r bg-card p-2">
                    <span className="text-xs font-medium text-muted-foreground">{formatHour(hour)}</span>
                  </div>
                  {weekDates.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="h-20 border-r p-2 transition-colors hover:bg-muted/50 last:border-r-0"
                    >
                      {/* Event slots - can be populated with actual events */}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
