"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Edit,
  Eye,
  Trash2,
  Plus,
  Star,
  StarOff,
  Search,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getAllEvents,
  deleteEvent,
  setLatestEvent,
} from "@/lib/actions/event-actions";

type EventType = "EVENT" | "RECOGNITION" | "TEAM";

interface Event {
  id: string;
  type: EventType;
  title: string;
  time: string;
  date: Date;
  location: string;
  address: string;
  description: string;
  ceus: number;
  image: string;
  expected_attendees: number;
  createdAt: Date;
  updatedAt: Date;
  isFinished: boolean;
  isLatest: boolean;
}

export default function EventAdminDashboard() {
  const [eventItems, setEventItems] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEvents();
      if (typeof data === "string") {
        toast(data);
        setIsLoading(false);
        return;
      }
      setEventItems(data);
      setIsLoading(false);
    } catch {
      toast("Failed to fetch event items");
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      toast("Event item deleted successfully");
      fetchEvents();
    } catch {
      toast("Failed to delete event item");
    }
  };

  const handleSetLatest = async (id: string) => {
    try {
      await setLatestEvent(id);
      toast("Event item set as latest successfully");
      fetchEvents();
    } catch {
      toast("Failed to update event item");
    }
  };

  const filteredEvents = eventItems.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "events") return matchesSearch && event.type === "EVENT";
    if (activeTab === "recognition")
      return matchesSearch && event.type === "RECOGNITION";
    if (activeTab === "team") return matchesSearch && event.type === "TEAM";
    if (activeTab === "latest") return matchesSearch && event.isLatest;
    if (activeTab === "finished") return matchesSearch && event.isFinished;

    return matchesSearch;
  });

  const getBadgeVariant = (type: EventType) => {
    switch (type) {
      case "EVENT":
        return "blue";
      case "RECOGNITION":
        return "purple";
      case "TEAM":
        return "green";
      default:
        return "secondary";
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div
      className="w-full py-4 sm:py-6 md:py-8 lg:py-12 min-h-screen px-4 sm:px-6 md:px-8"
      style={{ background: "#003366" }}
    >
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white drop-shadow-lg">
            Event Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mt-2 sm:mt-3 font-semibold drop-shadow">
            Manage all events, announcements, and recognitions
          </p>
        </div>
        <Link href="/admin/events/create">
          <Button className="gap-2 sm:gap-3 md:gap-4 h-auto p-3 sm:p-4 md:p-5 lg:p-6 text-sm sm:text-base md:text-lg lg:text-xl font-semibold bg-white text-[#003366] hover:bg-gray-100 hover:text-[#003366] w-full sm:w-auto">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
            Create Events
          </Button>
        </Link>
      </div>

      <Card className="p-2 sm:p-3 md:p-4">
        <CardHeader className="pb-4 sm:pb-5 md:pb-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            Events Dashboard
          </CardTitle>
          <CardDescription className="text-sm sm:text-base md:text-lg lg:text-xl">
            View, edit, and manage all event items. Click on an event item to
            see more details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:gap-6">
            <div className="relative w-full">
              <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-500" />
              <Input
                placeholder="Search events..."
                className="pl-10 sm:pl-12 md:pl-14 h-10 sm:h-11 md:h-12 text-sm sm:text-base md:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={fetchEvents}
                className="gap-2 sm:gap-3 h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 text-sm sm:text-base md:text-lg order-2 sm:order-1"
              >
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6 sm:mb-8 grid w-full grid-cols-3 h-10 sm:h-12 md:h-14">
              <TabsTrigger
                value="all"
                className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="latest"
                className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold hidden lg:block"
              >
                Latest
              </TabsTrigger>
              <TabsTrigger
                value="finished"
                className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold hidden lg:block"
              >
                Finished
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="rounded-lg sm:rounded-xl border shadow-sm overflow-hidden">
                {/* Mobile Cards View */}
                <div className="block md:hidden">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="text-base sm:text-lg">
                        Loading event items...
                      </div>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-base sm:text-lg">
                        No event items found.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4">
                      {filteredEvents.map((event) => (
                        <Card key={event.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {event.isLatest && (
                                  <Star className="h-4 w-4 text-yellow-500" />
                                )}
                                <h3 className="font-semibold text-sm">
                                  {event.title}
                                </h3>
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div>Type: {event.type}</div>
                                <div>
                                  {format(new Date(event.date), "MMM d, yyyy")}
                                </div>
                                <div>{event.location}</div>
                                <div>
                                  {event.isFinished ? "Finished" : "Active"}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/event-registration/details/${event.id}`
                                  )
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/admin/events/edit/${event.id}`)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-sm">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-lg">
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
                                      This will permanently delete &quot;
                                      {event.title}&quot;.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel className="text-sm px-4 py-2">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 text-white hover:bg-red-700 text-sm px-4 py-2"
                                      onClick={() =>
                                        handleDeleteEvent(event.id)
                                      }
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Title
                        </TableHead>
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Type
                        </TableHead>
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Date
                        </TableHead>
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Location
                        </TableHead>
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Status
                        </TableHead>
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 sm:h-32 text-center text-base sm:text-lg md:text-xl"
                          >
                            Loading event items...
                          </TableCell>
                        </TableRow>
                      ) : filteredEvents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 sm:h-32 text-center text-base sm:text-lg md:text-xl"
                          >
                            No event items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEvents.map((event) => (
                          <TableRow
                            key={event.id}
                            className="hover:bg-gray-50/50"
                          >
                            <TableCell className="font-semibold py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                {event.isLatest && (
                                  <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-500" />
                                )}
                                <span className="text-sm sm:text-base md:text-lg">
                                  {event.title}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <Badge
                                variant="outline"
                                className={`text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 bg-${getBadgeVariant(
                                  event.type
                                )}-100 text-${getBadgeVariant(
                                  event.type
                                )}-800 border-${getBadgeVariant(
                                  event.type
                                )}-200`}
                              >
                                {event.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-500" />
                                <span className="text-sm sm:text-base md:text-lg">
                                  {format(new Date(event.date), "MMM d, yyyy")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5">
                              {event.location}
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              {event.isFinished ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 bg-gray-100 text-gray-800 border-gray-200"
                                >
                                  Finished
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 bg-green-100 text-green-800 border-green-200"
                                >
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right py-3 sm:py-4 md:py-5">
                              <div className="flex justify-end gap-1 sm:gap-2 md:gap-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                                  onClick={() =>
                                    router.push(
                                      `/event-registration/details/${event.id}`
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                                  onClick={() =>
                                    router.push(
                                      `/admin/events/edit/${event.id}`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                                  onClick={() => handleSetLatest(event.id)}
                                >
                                  {event.isLatest ? (
                                    <StarOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                  ) : (
                                    <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                                    >
                                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="max-w-sm sm:max-w-md md:max-w-lg">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-lg sm:text-xl md:text-2xl">
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-sm sm:text-base md:text-lg">
                                        This action cannot be undone. This will
                                        permanently delete the event item &quot;
                                        {event.title}&quot;.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2 sm:gap-3">
                                      <AlertDialogCancel className="text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-2 sm:py-3">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-600 text-white hover:bg-red-700 text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-2 sm:py-3"
                                        onClick={() =>
                                          handleDeleteEvent(event.id)
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
