"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Award,
  ArrowRight,
  Search,
  ChevronDown,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import {
  getLatestEvent,
  getNotLatestEvents,
} from "@/lib/actions/event-actions";
import type { IEvent } from "@/lib/interfaces";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const EVENTS_PER_PAGE = 3;

export default function EventRegistration() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<IEvent[] | undefined>([]);
  const [latestEvent, setLatestEvent] = useState<IEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [dateFilter, setDateFilter] = useState("All dates");
  const [ceuFilter, setCeuFilter] = useState("All CEUs");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string, alt: string } | null>(null);

  // Memoized unique values to prevent unnecessary recalculations
  const uniqueLocations = useMemo(() => {
    const locations = events?.map((event) => event.location).filter(Boolean);
    return ["All locations", ...Array.from(new Set(locations))];
  }, [events]);

  const uniqueCEUs = useMemo(() => {
    const ceus = events?.map((event) => event.ceus).filter(Boolean);
    return ["All CEUs", ...Array.from(new Set(ceus)).sort((a, b) => a - b)];
  }, [events]);

  // Memoized date filter options
  const dateFilterOptions = useMemo(
    () => [
      "All dates",
      "This week",
      "This month",
      "Next month",
      "Next 3 months",
    ],
    []
  );

  // Optimized event fetching
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const [eventsData, latestData] = await Promise.all([
          getNotLatestEvents(),
          getLatestEvent(),
        ]);

        if (typeof latestData === "string") {
          console.error(latestData);
          return;
        }

        if (typeof eventsData === "string") {
          console.error(eventsData);
          return;
        }

        // Process events once
        const processedEvents = eventsData?.map((event) => ({
          ...event,
          ytLink: event.ytLink === null ? undefined : event.ytLink,
        }));

        setEvents(processedEvents);
        setLatestEvent(
          latestData
            ? {
              ...latestData,
              ytLink:
                latestData.ytLink === null ? undefined : latestData.ytLink,
            }
            : null
        );
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Optimized filtering with useMemo to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered?.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (locationFilter !== "All locations") {
      filtered = filtered?.filter((event) => event.location === locationFilter);
    }

    // CEU filter
    if (ceuFilter !== "All CEUs") {
      const ceuValue = parseInt(ceuFilter);
      filtered = filtered?.filter((event) => event.ceus === ceuValue);
    }

    // Date filter
    if (dateFilter !== "All dates") {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      const getDateRange = () => {
        switch (dateFilter) {
          case "This week":
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          case "This month":
            return new Date(now.getFullYear(), now.getMonth() + 1, 0);
          case "Next month":
            return new Date(now.getFullYear(), now.getMonth() + 2, 0);
          case "Next 3 months":
            return new Date(now.getFullYear(), now.getMonth() + 4, 0);
          default:
            return null;
        }
      };

      const endDate = getDateRange();
      if (endDate) {
        filtered = filtered?.filter((event) => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);

          if (dateFilter === "Next month") {
            const currentMonth = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0
            );
            return eventDate > currentMonth && eventDate <= endDate;
          }
          return eventDate >= now && eventDate <= endDate;
        });
      }
    }

    return filtered;
  }, [events, searchQuery, locationFilter, dateFilter, ceuFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents!.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;
  const currentEvents = filteredEvents?.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredEvents]);

  const openImage = useCallback((imageUrl: string | undefined, title: string) => {
    if (imageUrl) {
      setSelectedImage({
        src: imageUrl,
        alt: title
      });
      setIsImageModalOpen(true);
    } else {
      console.warn("No image URL provided for modal.");
    }
  }, []);

  // Memoized filter state
  const hasActiveFilters = useMemo(
    () =>
      searchQuery.trim() ||
      locationFilter !== "All locations" ||
      dateFilter !== "All dates" ||
      ceuFilter !== "All CEUs",
    [searchQuery, locationFilter, dateFilter, ceuFilter]
  );

  // Optimized clear filters function
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setLocationFilter("All locations");
    setDateFilter("All dates");
    setCeuFilter("All CEUs");
    setIsFiltersOpen(false);
    setCurrentPage(1);
  }, []);

  // Optimized search input handler with debouncing
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    // Smooth scroll to events section
    const eventsSection = document.getElementById("events-section");
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const goToPrevious = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const goToNext = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-50"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-12 sm:py-20 relative overflow-hidden">
        {/* Optimized Background Pattern */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute right-0 top-0 w-1/2 h-full">
            <div className="flex justify-end items-center h-full space-x-2 pr-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-full opacity-20 animate-pulse"
                  style={{
                    height: `${Math.random() * 60 + 20}px`,
                    width: "4px",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Discover. Learn. Excel!
              <br />
              <span className="text-blue-200 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                Professional Development Events
              </span>
            </h1>

            {/* Mobile-Optimized Search Bar */}
            <div className="max-w-4xl mx-auto mt-8 sm:mt-12">
              {/* Mobile Search */}
              <div className="block lg:hidden">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  {/* Search Input */}
                  <div className="flex items-center px-3 mb-3">
                    <Search className="w-5 h-5 text-white/70 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="bg-transparent text-white placeholder-white/70 outline-none flex-1 text-base"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-2 text-white/70 hover:text-white"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Mobile Filters Button */}
                  <div className="flex items-center justify-between">
                    <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-white hover:bg-white/20 flex items-center"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filters
                          {hasActiveFilters && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {
                                [
                                  searchQuery,
                                  locationFilter !== "All locations" ? 1 : 0,
                                  dateFilter !== "All dates" ? 1 : 0,
                                  ceuFilter !== "All CEUs" ? 1 : 0,
                                ].filter(Boolean).length
                              }
                            </span>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[80vh]">
                        <SheetHeader>
                          <SheetTitle>Filter Events</SheetTitle>
                          <SheetDescription>
                            Narrow down your search results
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          {/* Location Filter */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Location
                            </label>
                            <select
                              value={locationFilter}
                              onChange={(e) =>
                                setLocationFilter(e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                            >
                              {uniqueLocations.map((location) => (
                                <option key={location} value={location}>
                                  {location}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Date Filter */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Date
                            </label>
                            <select
                              value={dateFilter}
                              onChange={(e) => setDateFilter(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                            >
                              {dateFilterOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* CEU Filter */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              CEUs
                            </label>
                            <select
                              value={ceuFilter}
                              onChange={(e) => setCeuFilter(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                            >
                              {uniqueCEUs.map((ceu) => (
                                <option key={ceu} value={ceu.toString()}>
                                  {ceu}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Filter Actions */}
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={clearFilters}
                              variant="outline"
                              className="flex-1"
                            >
                              Clear All
                            </Button>
                            <Button
                              onClick={() => setIsFiltersOpen(false)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              Apply Filters
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <Button className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Search */}
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                  <div className="flex items-center gap-2">
                    {/* Search Input */}
                    <div className="flex-1 flex items-center px-4 min-w-0">
                      <Search className="w-5 h-5 text-white/70 mr-3 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search events, topics, or descriptions..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="bg-transparent text-white placeholder-white/70 outline-none flex-1 text-lg min-w-0"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-2 text-white/70 hover:text-white"
                          aria-label="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Location Filter */}
                    <div className="flex items-center px-4 border-l border-white/20">
                      <MapPin className="w-5 h-5 text-white/70 mr-2" />
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center text-white hover:text-blue-200 outline-none">
                          <span className="mr-2 truncate max-w-32">
                            {locationFilter}
                          </span>
                          <ChevronDown className="w-4 h-4 text-white/70" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white text-gray-900 border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                          {uniqueLocations.map((location) => (
                            <DropdownMenuItem
                              key={location}
                              onClick={() => setLocationFilter(location)}
                              className="hover:bg-blue-50 cursor-pointer"
                            >
                              {location}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center px-4 border-l border-white/20">
                      <Calendar className="w-5 h-5 text-white/70 mr-2" />
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center text-white hover:text-blue-200 outline-none">
                          <span className="mr-2 truncate max-w-32">
                            {dateFilter}
                          </span>
                          <ChevronDown className="w-4 h-4 text-white/70" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white text-gray-900 border border-gray-200 shadow-lg">
                          {dateFilterOptions.map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onClick={() => setDateFilter(option)}
                              className="hover:bg-blue-50 cursor-pointer"
                            >
                              {option}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* CEU Filter */}
                    <div className="flex items-center px-4 border-l border-white/20">
                      <Award className="w-5 h-5 text-white/70 mr-2" />
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center text-white hover:text-blue-200 outline-none">
                          <span className="mr-2 truncate max-w-20">
                            {ceuFilter}
                          </span>
                          <ChevronDown className="w-4 h-4 text-white/70" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white text-gray-900 border border-gray-200 shadow-lg">
                          {uniqueCEUs.map((ceu) => (
                            <DropdownMenuItem
                              key={ceu}
                              onClick={() => setCeuFilter(ceu.toString())}
                              className="hover:bg-blue-50 cursor-pointer"
                            >
                              {ceu}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Search Button */}
                    <Button className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
                  <span className="text-white/70 text-sm">Active filters:</span>
                  {searchQuery && (
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      Search: &quot;{searchQuery}&quot;
                    </span>
                  )}
                  {locationFilter !== "All locations" && (
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      📍 {locationFilter}
                    </span>
                  )}
                  {dateFilter !== "All dates" && (
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      📅 {dateFilter}
                    </span>
                  )}
                  {ceuFilter !== "All CEUs" && (
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      🏆 {ceuFilter} CEUs
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm flex items-center transition-colors"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events-section" className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {hasActiveFilters ? "Filtered Events" : "Upcoming Events"}
              </h2>
              <p className="text-gray-600 mt-2">
                {hasActiveFilters
                  ? `Showing ${filteredEvents?.length} of ${events!.length} events`
                  : `${events!.length} events available`}
                {filteredEvents!.length > EVENTS_PER_PAGE && (
                  <span className="ml-2">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Featured Event */}
          {latestEvent && !hasActiveFilters && (
            <Card className="mb-8 sm:mb-12 border-0 shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div
                  className="relative h-64 sm:h-80 md:h-auto"
                  onClick={() => {
                    openImage(latestEvent.image, latestEvent.title)
                  }}
                >
                  <Image
                    src={
                      latestEvent.image ||
                      "/placeholder.svg?height=400&width=600&query=nursing conference event"
                    }
                    alt={latestEvent.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      Featured Event
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {latestEvent.date.getDate()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 uppercase">
                      {latestEvent.date.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {latestEvent.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      {latestEvent.description}
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center text-gray-600 text-sm sm:text-base">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                      <span>{latestEvent.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm sm:text-base">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                      <span>{latestEvent.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm sm:text-base">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{latestEvent.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm sm:text-base">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                      <span>{latestEvent.ceus} CEUs Available</span>
                    </div>
                  </div>

                  <Link
                    href={`/event-registration/details/${encodeURIComponent(
                      latestEvent.title
                    )}`}
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 font-semibold rounded-lg">
                      Register Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          )}

          {/* No Results Message */}
          {filteredEvents!.length === 0 && hasActiveFilters && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                No events found
              </h3>
              <p className="text-gray-500 mb-4 text-sm sm:text-base">
                Try adjusting your search criteria or clearing some filters.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Event Grid */}
          {currentEvents!.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentEvents?.map((event, index) => (
                  <Card
                    key={`${event.title}-${startIndex + index}`}
                    className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
                  >
                    <div
                      className="relative h-40 sm:h-48 overflow-hidden rounded-t-lg"
                      onClick={() => openImage(event.image, event.title)}
                    >
                      <Image
                        src={
                          event.image ||
                          "/placeholder.svg?height=200&width=300&query=nursing professional event"
                        }
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                          {event.ceus} CEUs
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-white backdrop-blur-sm rounded-lg p-1.5 sm:p-2">
                        <div className="text-base sm:text-lg font-bold text-blue-600">
                          {event.date.getDate()}
                        </div>
                        <div className="text-xs text-gray-600 uppercase">
                          {event.date.toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <div className="mb-4">
                        <div className="text-blue-600 font-semibold text-xs sm:text-sm mb-2">
                          {event.date.toLocaleDateString()} • {event.time}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                      <Link
                        href={`/event-registration/details/${encodeURIComponent(
                          event.title
                        )}`}
                      >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 font-semibold rounded-lg group text-sm sm:text-base">
                          Learn More
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between">
                  {/* Pagination Info */}
                  <div className="text-sm text-gray-600 sm:order-1">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredEvents!.length)} of{" "}
                    {filteredEvents!.length} events
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2 sm:order-2">
                    {/* Previous Button */}
                    <Button
                      onClick={goToPrevious}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          // Show first page, last page, current page, and pages around current page
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1;

                          if (!showPage && page === 2 && currentPage > 4) {
                            return (
                              <span key={page} className="text-gray-400 px-2">
                                ...
                              </span>
                            );
                          }
                          if (
                            !showPage &&
                            page === totalPages - 1 &&
                            currentPage < totalPages - 3
                          ) {
                            return (
                              <span key={page} className="text-gray-400 px-2">
                                ...
                              </span>
                            );
                          }
                          if (!showPage) {
                            return null;
                          }

                          return (
                            <Button
                              key={page}
                              onClick={() => goToPage(page)}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              className={`w-8 h-8 p-0 ${currentPage === page
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "hover:bg-blue-50"
                                }`}
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    {/* Next Button */}
                    <Button
                      onClick={goToNext}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Advance Your Career?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of Filipino-American nurses advancing their careers
            through professional development
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/membership">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 font-semibold rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Become a Member
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-white">
          <DialogTitle className="sr-only">
            {selectedImage?.alt || "Event Image"}
          </DialogTitle>
          <div className="relative w-full h-[80vh]">
            {selectedImage && (
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
