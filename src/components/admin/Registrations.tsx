"use client"

import { useState, useEffect } from "react"
import { Check, X, Clock, Search, RefreshCw, Award, Newspaper, User, Mail, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  getEventRegistrationStats,
  getEventRegistrations,
  approveEventRegistration,
  rejectEventRegistration,
} from "@/lib/actions/event-member-actions"
import { getAllEvents } from "@/lib/actions/event-actions"
import type { EventRegistration, EventRegistrationStats, IEvent } from "@/lib/interfaces"

export default function RegistrationDashboard() {
  const [events, setEvents] = useState<IEvent[]>([])
  const [stats, setStats] = useState<EventRegistrationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null)
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([])
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)

  const fetchStuff = async () => {
    setIsLoading(true)
    try {
      const [events, statsData] = await Promise.all([getAllEvents(), getEventRegistrationStats()])

      if (typeof events === "string") {
        toast("No events found")
        setStats(null)
        setIsLoading(false)
        return
      } else {
        setEvents(events)
        setStats(statsData.data!)
        toast("Events fetched successfully")
        setIsLoading(false)
        return
      }
    } catch {
      console.error("Error fetching Events")
      toast("Failed to fetch Events")
    }
  }

  const fetchEventRegistrations = async (eventId: string) => {
    setIsLoadingRegistrations(true)
    try {
      const registrations = await getEventRegistrations(eventId);
      if (!registrations || registrations.length === 0) {
        toast("No registrations found for this event.");
      } else {
        setEventRegistrations(registrations);
      }
    } catch (error) {
      console.error("Error fetching event registrations:", error)
      toast("Failed to fetch registrations")
      setEventRegistrations([])
    } finally {
      setIsLoadingRegistrations(false)
    }
  }

  const handleEventClick = async (event: IEvent) => {
    setEventRegistrations([]);
    setSelectedEvent(event)
    setIsModalOpen(true)
    await fetchEventRegistrations(event.id)
  }

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      await approveEventRegistration(registrationId)
      toast("Registration approved successfully")

      // Refresh the registrations for this event
      if (selectedEvent) {
        await fetchEventRegistrations(selectedEvent.id)
      }

      // Refresh overall stats
      const statsData = await getEventRegistrationStats()
      setStats(statsData.data!)
    } catch (error) {
      console.error("Error approving registration:", error)
      toast("Failed to approve registration")
    }
  }

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      await rejectEventRegistration(registrationId)
      toast("Registration rejected successfully")

      // Refresh the registrations for this event
      if (selectedEvent) {
        await fetchEventRegistrations(selectedEvent.id)
      }

      // Refresh overall stats
      const statsData = await getEventRegistrationStats()
      setStats(statsData.data!)
    } catch (error) {
      console.error("Error rejecting registration:", error)
      toast("Failed to reject registration")
    }
  }

  const getStatusBadge = (isPending: boolean, rejected: boolean) => {
    switch (isPending) {
      case true:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case false:
        switch (rejected) {
          case true:
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
          case false:
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
        }
    }
  }

  useEffect(() => {
    fetchStuff()
  }, [])

  const filteredEvents = events.filter((event) => {
    return event.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div
      className="w-full py-4 sm:py-6 md:py-8 lg:py-12 min-h-screen px-4 sm:px-6 md:px-8"
      style={{ background: "#003366" }}
    >
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white drop-shadow-lg">
            Event Registrations
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mt-2 sm:mt-3 font-semibold drop-shadow">
            Review and manage Event Registrations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 grid gap-4 sm:gap-6 md:gap-8 grid-cols-2 lg:grid-cols-4">
          <Card className="p-2 sm:p-3 md:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
              <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
                Total Registrations
              </CardTitle>
              <Award className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-3 md:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
              <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
                Pending Registrations
              </CardTitle>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-3 md:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
              <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">Approved</CardTitle>
              <Check className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-green-600">
                {stats.approved}
              </div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-3 md:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
              <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">Rejected</CardTitle>
              <X className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-red-600">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="p-2 sm:p-3 md:p-4">
        <CardHeader className="pb-4 sm:pb-5 md:pb-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            Registrations Dashboard
          </CardTitle>
          <CardDescription className="text-sm sm:text-base md:text-lg lg:text-xl">
            Review, approve, or reject event registration requests. Click on an event to see registration details.
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
                onClick={fetchStuff}
                className="gap-2 sm:gap-3 h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 text-sm sm:text-base md:text-lg order-2 sm:order-1 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value={activeTab}>
              <div className="rounded-lg sm:rounded-xl border shadow-sm overflow-hidden">
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Event</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Location</TableHead>
                        <TableHead className="font-semibold">Registrations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 sm:h-32 text-center text-base sm:text-lg md:text-xl">
                            Loading events...
                          </TableCell>
                        </TableRow>
                      ) : filteredEvents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 sm:h-32 text-center text-base sm:text-lg md:text-xl">
                            No events found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEvents.map((event) => (
                          <TableRow
                            key={event.id}
                            className="hover:bg-gray-50/50 cursor-pointer"
                            onClick={() => handleEventClick(event)}
                          >
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-500" />
                                <div className="font-semibold text-sm sm:text-base md:text-lg">{event.title}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {event.date ? new Date(event.date).toLocaleDateString() : "TBD"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{event.location || "TBD"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <Badge variant="secondary">Click to view</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading events...</div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-8">No events found.</div>
                  ) : (
                    filteredEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleEventClick(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Newspaper className="h-5 w-5 text-gray-500 mt-1" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-base">{event.title}</h3>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{event.date ? new Date(event.date).toLocaleDateString() : "TBD"}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location || "TBD"}</span>
                              </div>
                            </div>
                            <Badge variant="secondary">View</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Registration Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[90vw] !max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedEvent?.title} - Registrations</DialogTitle>
            <DialogDescription>Review and manage registration requests for this event.</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {isLoadingRegistrations ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                Loading registrations...
              </div>
            ) : eventRegistrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No registrations found for this event.</div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">Total registrations: {eventRegistrations.length}</div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <div
                                  className="font-medium"
                                >
                                  {registration.member ? registration.member.fullName : registration.nonMember?.fullName}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span>
                                  {registration.member ? registration.member.email : registration.nonMember?.email}
                                </span>
                              </div>
                              {registration.member ?
                                (<div className="text-sm text-gray-600">{registration.member.phoneNumber}</div>) :
                                (registration.nonMember?.phoneNumber)
                              }
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(registration.isPending, registration.rejected)}</TableCell>
                          <TableCell>{registration.member ? "yes" : "no"}</TableCell>
                          <TableCell>
                            {registration.isPending && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                                  onClick={() => handleApproveRegistration(registration.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                                  onClick={() => handleRejectRegistration(registration.id)}
                                >
                                  <X className="h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {registration.isPending && (
                              <span className="text-sm text-gray-500">
                                {registration.isPending ? "Approved" : "Rejected"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}