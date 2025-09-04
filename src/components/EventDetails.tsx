"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, DollarSign, Award, Star } from "lucide-react"
import Link from "next/link"
import { getEventByTitle } from "@/lib/actions/event-actions"
import { IEvent } from "@/lib/interfaces"
import RegisterModal from "./RegisterModal"

export default function EventDetails(title: { title: string }) {

  const [eventDetail, setEventDetail] = useState<IEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    async function fetchEventDetail() {
      try {
        setIsLoading(true)
        const event = await getEventByTitle(title.title.replace(/%20/g, " "))
        if (event) {
          setEventDetail({ ...event, ytLink: event.ytLink ?? undefined })
        } else {
          setEventDetail(null)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch event details:", error)
        setIsLoading(false)
      }
    }

    fetchEventDetail()
  }, [title])

  const handleRegisterClick = () => {
    setIsRegistrationModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-50"></div>
      </div>
    );
  }

  return (
    eventDetail && (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          <Link href="/event-registration">
            <Button className="z-30 absolute top-6 left-6 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              {/* Show ArrowLeft icon only on small screens, show text on md+ */}
              <span className="block md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </span>
              <span className="hidden md:block">
                Back to Events
              </span>
            </Button>
          </Link>

          <div className="relative container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-600/20 border border-red-400/30 text-red-200 text-sm font-medium mb-8">
                <Award className="w-4 h-4 mr-2" />
                EVENT DETAILS
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{eventDetail.title}</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join us for an exceptional professional development experience designed to advance your nursing career
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Event Image */}
                  <Card className="overflow-hidden border-0 shadow-2xl">
                    <div
                      className="relative h-80"
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <Image
                        src={eventDetail.image || "/window.svg"}
                        alt={eventDetail.title}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-6 right-6">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          {eventDetail.ceus} CEUs Available
                        </span>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                          <h2 className="text-xl font-bold text-gray-900 mb-2">{eventDetail.title}</h2>
                          <div className="flex items-center text-blue-600 font-semibold">
                            <Calendar className="w-4 h-4 mr-2" />
                            {eventDetail.date.toLocaleDateString()} • {eventDetail.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Event Description */}
                  <Card className="border-0 shadow-xl bg-white">
                    <CardContent className="p-8">
                      <div className="mb-8">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">About This Event</h2>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
                          <p className="text-gray-700 leading-relaxed text-lg">{eventDetail.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Event Details Card */}
                  <Card className="border-0 shadow-xl sticky top-6 bg-white">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Event Information</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <Calendar className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{eventDetail.date.toLocaleDateString()}</div>
                              <div className="text-gray-600">{eventDetail.time}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <MapPin className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                            <div>
                              <div className="font-semibold text-gray-900">{eventDetail.location}</div>
                              <div className="text-gray-600">{eventDetail.address}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-start">
                            <DollarSign className="w-6 h-6 text-green-600 mr-4 mt-1" />
                            <div>
                              <div className="font-semibold text-green-800">Registration Fee</div>
                              <div className="text-green-600 font-medium">Free for FAPRNA Members</div>
                              <div className="text-gray-600">$25 for Non-Members</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-start">
                            <Award className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                            <div>
                              <div className="font-semibold text-blue-800">CEUs Available</div>
                              <div className="text-blue-600 font-medium">
                                {eventDetail.ceus} Continuing Education Credits
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* YouTube Link Box */}
                      {eventDetail.ytLink && (
                        <Button
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-semibold rounded-lg mt-6 flex items-center justify-center gap-2"
                          asChild
                        >
                          <a
                            href={eventDetail.ytLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.946C18.2 5.5 12 5.5 12 5.5s-6.2 0-7.86.555A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 1.5 12a28.6 28.6 0 0 0 .7 3.999 2.75 2.75 0 0 0 1.94 1.946C5.8 18.5 12 18.5 12 18.5s6.2 0 7.86-.555a2.75 2.75 0 0 0 1.94-1.946A28.6 28.6 0 0 0 22.5 12a28.6 28.6 0 0 0-.7-3.999zM10 15.5v-7l6 3.5-6 3.5z" />
                            </svg>
                            Watch Event Recording
                          </a>
                        </Button>
                      )}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <Button
                          onClick={handleRegisterClick}
                          className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl mb-4"
                        >
                          Register Now
                        </Button>
                        <p className="text-center text-sm text-gray-500">
                          Registration closes 48 hours before the event
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Member Benefits Card */}
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-red-50">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Not a Member Yet?</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Join FAPRNA-NV and get free access to all events plus exclusive member benefits.
                        </p>
                        <Link href="/membership">
                          <Button
                            variant="outline"
                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                          >
                            Learn About Membership
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
        <RegisterModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          event={eventDetail}
        />
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogTitle>
            <Button
              variant="ghost"
              className="absolute top-4 right-4 z-10"
              onClick={() => setIsImageModalOpen(false)}
            >
              <span className="sr-only">Close</span>
            </Button>
          </DialogTitle>
          <DialogContent className="max-w-4xl p-0 bg-black">
            <div className="relative w-full h-[80vh]">
              <Image
                src={eventDetail.image || "/window.svg"}
                alt={eventDetail.title}
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  )
}
