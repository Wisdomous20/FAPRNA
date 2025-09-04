"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "../utils"
import { IEvent } from "../interfaces"

// Get all event items
export async function getAllEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "desc",
      },
    })

    if (events.length === 0) return "No events yet"

    return events
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return "Failed to fetch events. Please try again later."
  }
}

export async function getFirstTwoEvents(): Promise<IEvent[]> {
  try {
    const events = await prisma.event.findMany({
      where: { isLatest: false },
      take: 2,
      orderBy: {
        date: "desc",
      },
    });

    return events
  } catch {
    throw new Error("Failed to fetch events")
  }
}

export async function getNotLatestEvents(): Promise<IEvent[] | undefined> {
  try {
    const events = await prisma.event.findMany({
      where: { isLatest: false },
      orderBy: {
        date: "desc",
      },
    })

    if (events.length === 0) throw new Error("No non-latest events found")

    return events
  } catch (error) {
    console.error("Failed to fetch events:", error)
  }
}

export async function getLatestEvent(): Promise<IEvent | undefined> {
  try {
    const latestEvent = await prisma.event.findFirst({
      where: { isLatest: true },
    })

    if (!latestEvent) {
      throw new Error("No latest event found")
    }

    return latestEvent
  } catch (error) {
    console.error("Failed to fetch latest event:", error)
  }
}

// Get event by title
export async function getEventByTitle(title: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { title },
    })
    return event
  } catch (error) {
    console.error(`Failed to fetch event title: ${title}:`, error)
    throw new Error(`Failed to fetch event title: ${title}`)
  }
}

// Get event by ID
export async function getEventById(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
    })
    return event
  } catch (error) {
    console.error(`Failed to fetch event id: ${id}:`, error)
    throw new Error(`Failed to fetch event id: ${id}`)
  }
}

// Create new event item
export async function createEvent(data: IEvent) {
  try {
    // If this event is set as latest, unset any other latest events
    if (data.isLatest) {
      await prisma.event.updateMany({
        where: { isLatest: true },
        data: { isLatest: false },
      })
    }

    const event = await prisma.event.create({
      data,
    })

    revalidatePath("/admin/events")
    revalidatePath("/")
    revalidatePath("/event-registration")

    return event
  } catch (error) {
    console.error("Failed to create event:", error)
    throw new Error("Failed to create event")
  }
}

export async function updateEvent(id: string, data: IEvent) {
  try {
    // If this event is set as latest, unset any other latest event
    if (data.isLatest) {
      await prisma.event.updateMany({
        where: {
          isLatest: true,
          id: { not: id },
        },
        data: { isLatest: false },
      })
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        ceus: typeof data.ceus === "string" ? Number(data.ceus) : data.ceus,
      }
    })

    revalidatePath("/admin/events")
    revalidatePath("/")
    revalidatePath("/event-registration")
    revalidatePath(`/event-registration/details/${id}`)

    return event
  } catch (error) {
    console.error(`Failed to update event with ID ${id}:`, error)
    throw new Error(`Failed to update event with ID ${id}`)
  }
}

// Delete event item
export async function deleteEvent(id: string) {
  try {
    await prisma.event.delete({
      where: { id },
    })

    revalidatePath("/admin/events")
    revalidatePath("/")
    revalidatePath("/event-registration")

    return { success: true }
  } catch (error) {
    console.error(`Failed to delete event with ID ${id}:`, error)
    throw new Error(`Failed to delete event with ID ${id}`)
  }
}

// Set event as latest
export async function setLatestEvent(id: string) {
  try {
    // Get current status
    const currentEvent = await prisma.event.findUnique({
      where: { id },
      select: { isLatest: true },
    })

    // If setting to latest, unset any other latest events
    if (!currentEvent?.isLatest) {
      await prisma.event.updateMany({
        where: { isLatest: true },
        data: { isLatest: false },
      })
    }

    // Toggle the isLatest status
    const event = await prisma.event.update({
      where: { id },
      data: { isLatest: !currentEvent?.isLatest },
    })

    revalidatePath("/admin/events")
    revalidatePath("/")
    revalidatePath("/event-registration")

    return event
  } catch (error) {
    console.error(`Failed to update latest status for event with ID ${id}:`, error)
    throw new Error(`Failed to update latest status for event with ID ${id}`)
  }
}
