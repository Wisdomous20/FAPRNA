"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFirstTwoEvents, getLatestEvent } from "@/lib/actions/event-actions";
import type { IEvent } from "@/lib/interfaces";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Event Card Component
interface EventCardProps {
  event: IEvent;
  className?: string;
  onClick?: () => void;
}

const EventCard = ({ event, className, onClick }: EventCardProps) => (
  <Card
    className={cn(
      "group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white cursor-pointer",
      className
    )}
    onClick={onClick}
  >
    {/* Image with gradient overlay */}
    <div className="relative h-48 overflow-hidden">
      <Image
        src={event.image || "/placeholder.png"}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        width={400}
        height={300}
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Overlay content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wide">
              {event.type}
            </span>
          </div>
          {event.ceus > 0 && (
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
              {event.ceus} CEUs
            </Badge>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" />
            <p className="text-sm font-medium tracking-wider text-white/90">
              {event.date instanceof Date
                ? event.date.toLocaleDateString()
                : event.date}
            </p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            <p className="text-xs font-medium text-white/80">{event.time}</p>
          </div>
          <h3 className="text-xl font-bold leading-tight mb-1">
            {event.title}
          </h3>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <p className="text-sm font-medium text-white/90">
              {event.location}
            </p>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <ExternalLink className="h-8 w-8 text-white" />
      </div>
    </div>

    <CardContent className="p-6 bg-white">
      <div className="mb-4">
        <p className="font-semibold text-gray-800">{event.location}</p>
        <p className="text-sm text-gray-600">{event.address}</p>
      </div>
      <p className="mb-6 text-gray-700 line-clamp-3">{event.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {event.ceus > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {event.ceus} CEUs
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#003366] hover:text-[#0056b3]"
        >
          Learn More →
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function FaprnaNews() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carousel state
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);

        const [latest, firstTwo] = await Promise.all([
          getLatestEvent(),
          getFirstTwoEvents(),
        ]);

        let combined: IEvent[] = [];
        if (latest) {
          combined.push(latest);
        }
        if (firstTwo) {
          const filtered = firstTwo.filter(
            (ev) => !latest || ev.id !== latest.id
          );
          combined = [...combined, ...filtered];
        }

        setEvents(combined);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && events.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % events.length);
      }, 5000);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, events.length]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && current < events.length - 1) {
          setCurrent(current + 1);
        } else if (diff < 0 && current > 0) {
          setCurrent(current - 1);
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => setIsAutoPlaying(true), 3000); // Resume auto-play after 3 seconds
  };

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrent((prev) => (prev > 0 ? prev - 1 : events.length - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  }, [events.length]);

  const goToNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % events.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  }, [events.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  const handleEventClick = (event: IEvent) => {
    // Navigate to event details page
    window.location.href = `/event-registration/details/${event.title}`;
  };

  if (isLoading) {
    return (
      <section className="w-full bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
              <div className="h-8 bg-gray-300 rounded w-96 mx-auto"></div>
              <div className="h-4 bg-gray-300 rounded w-64 mx-auto"></div>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                <div className="bg-white p-6 rounded-b-lg space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="w-full bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
            <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              No Events Available
            </h3>
            <p className="text-blue-600">
              Check back soon for upcoming events and announcements.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm uppercase tracking-wider text-gray-500">
            FAPRNA-NV News
          </p>
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
            What&apos;s Happening at Our Association
          </h2>
          <p className="text-lg text-gray-600">
            Monthly meetings and update of scheduled events
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="block md:hidden">
          <div
            className="relative w-full overflow-hidden rounded-lg"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-label="Events carousel"
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {events.map((event) => (
                <div key={event.id} className="min-w-full px-2">
                  <EventCard
                    event={event}
                    onClick={() => handleEventClick(event)}
                  />
                </div>
              ))}
            </div>

            {/* Navigation arrows */}
            {events.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                  onClick={goToPrevious}
                  aria-label="Previous event"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                  onClick={goToNext}
                  aria-label="Next event"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Carousel controls */}
          {events.length > 1 && (
            <div className="flex items-center justify-center mt-6 gap-4">
              {/* Dots */}
              <div className="flex gap-2">
                {events.map((_, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-200",
                      current === idx ? "bg-[#003366] w-6" : "bg-gray-300"
                    )}
                    onClick={() => {
                      setCurrent(idx);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 3000);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Auto-play toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="gap-2 text-gray-600"
              >
                {isAutoPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isAutoPlaying ? "Pause" : "Play"}
              </Button>
            </div>
          )}
        </div>

        {/* Desktop/Tablet View - Only Grid */}
        <div className="hidden md:block">
          <div
            className={cn(
              "grid gap-8",
              events.length === 1
                ? "md:grid-cols-1 justify-center"
                : events.length === 2
                  ? "md:grid-cols-2 justify-center"
                  : "md:grid-cols-2 lg:grid-cols-3"
            )}
            style={
              events.length < 3
                ? { justifyItems: "center" }
                : undefined
            }
          >
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
