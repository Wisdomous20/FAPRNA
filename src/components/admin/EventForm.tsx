"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createEvent, updateEvent } from "@/lib/actions/event-actions";
import { EventType } from "@/generated/prisma";
import { IEvent } from "@/lib/interfaces";
import { ImageUploadForm } from "@/components/admin/ImageUpload";

interface Event {
  id: string;
  type: "EVENT" | "RECOGNITION" | "TEAM";
  title: string;
  time: string;
  date: Date;
  location: string;
  address: string;
  description: string;
  ceus: number;
  image: string;
  ytLink?: string | undefined | null;
  zeffyRegisterLink?: string | null;
  expected_attendees: number;
  createdAt: Date;
  updatedAt: Date;
  isFinished: boolean;
  isLatest: boolean;
}

interface EventFormProps {
  event?: Event;
}

export default function EventForm({ event }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isEditing = !!event;

  // Initialize form with default values or existing event data
  const form = useForm<IEvent>({
    defaultValues: {
      type: event?.type || EventType.EVENT,
      title: event?.title || "",
      time: event?.time || "",
      date: event?.date ? new Date(event.date) : new Date(),
      location: event?.location || "",
      address: event?.address || "",
      description: event?.description || "",
      ceus: event?.ceus || 0,
      image: event?.image || "",
      ytLink: event?.ytLink || "",
      zeffyRegisterLink: event?.zeffyRegisterLink || "",
      expected_attendees: event?.expected_attendees || 0,
      isFinished: event?.isFinished || false,
      isLatest: event?.isLatest || false,
    },
  });

  // Helper to set image URL in the form from ImageUploadForm
  const setImageUrl = (url: string) => {
    form.setValue("image", url, { shouldValidate: true, shouldDirty: true });
  };

  // Handle form submission
  const onSubmit = async (values: IEvent) => {
    setIsSubmitting(true);
    try {
      const formattedValues = {
        ...values,
        ceus: Number(values.ceus),
        expected_attendees: Number(values.expected_attendees),
        date: values.date,
      };
      if (isEditing && event) {
        await updateEvent(event.id, values);
        toast("Event item updated successfully");
      } else {
        await createEvent(formattedValues);
        toast.success("Event item created successfully");
      }
      router.push("/admin/events");
      router.refresh();
    } catch {
      toast(
        isEditing
          ? "Failed to update event item"
          : "Failed to create event item"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: "#003366" }}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 lg:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white drop-shadow-lg">
          {isEditing ? "Edit Event" : "Create Event"}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mt-2 sm:mt-3 md:mt-4 font-semibold drop-shadow">
          {isEditing
            ? "Update existing event item details"
            : "Add a new event item to the website"}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 lg:pb-12">
        <Card className="p-3 sm:p-4 md:p-5 lg:p-6">
          <CardHeader className="pb-4 sm:pb-5 md:pb-6 lg:pb-8">
            <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              {isEditing ? "Edit Event Item" : "Create Event Item"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base md:text-lg lg:text-xl">
              Fill in the details below to{" "}
              {isEditing ? "update the" : "create a new"} event item.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  {/* Event Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    rules={{ required: "Please select a event type" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base md:text-lg">
                          Event Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm sm:text-base md:text-lg">
                              <SelectValue
                                placeholder="Select an event type"
                                className="text-sm sm:text-base md:text-lg"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value={EventType.EVENT}
                              className="text-sm sm:text-base md:text-lg"
                            >
                              Event
                            </SelectItem>
                            <SelectItem
                              value={EventType.RECOGNITION}
                              className="text-sm sm:text-base md:text-lg"
                            >
                              Recognition
                            </SelectItem>
                            <SelectItem
                              value={EventType.TEAM}
                              className="text-sm sm:text-base md:text-lg"
                            >
                              Team
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs sm:text-sm md:text-base">
                          Select the type of event item you are creating.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{
                      required: "Title is required",
                      minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter event title"
                            className="text-sm sm:text-base md:text-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          The title of the event item.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    rules={{ required: "Please select a date" }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal text-sm sm:text-base md:text-lg",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 sm:h-5 sm:w-5 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              autoFocus
                              captionLayout="dropdown"
                              endMonth={new Date(new Date().getFullYear() + 5, 11, 31)}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          The date when the event will take place.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time */}
                  <FormField
                    control={form.control}
                    name="time"
                    rules={{ required: "Please enter a time" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 8 am - 3pm"
                            className="text-sm sm:text-base md:text-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          The time of the event (e.g., 8 am - 3pm).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    rules={{
                      required: "Location is required",
                      minLength: {
                        value: 3,
                        message: "Location must be at least 3 characters",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter location name"
                            className="text-sm sm:text-base md:text-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          The venue or location name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    rules={{
                      required: "Address is required",
                      minLength: {
                        value: 3,
                        message: "Address must be at least 3 characters",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter full address"
                            className="text-sm sm:text-base md:text-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          The full address of the location.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CEUs */}
                  <FormField
                    control={form.control}
                    name="ceus"
                    rules={{
                      required: "CEUs is required",
                      min: {
                        value: 0,
                        message: "CEUs must be a non-negative number",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          CEUs
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-sm sm:text-base md:text-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          Number of Continuing Education Units available (0 if
                          none).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Expected Attendees */}
                  <FormField
                    control={form.control}
                    name="expected_attendees"
                    rules={{
                      required: "Expected attendees is required",
                      min: {
                        value: 0,
                        message:
                          "Expected attendees must be a non-negative number",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          Expected Attendees
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-sm sm:text-base md:text-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          Estimated number of attendees.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Registration Link */}
                  <FormField
                    control={form.control}
                    name="zeffyRegisterLink"
                    rules={{
                      pattern: {
                        value: /^$|https?:\/\/[\w.-]+\.[a-z]{2,}(\/\S*)?$/,
                        message: "Please enter a valid URL",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          Registration Link
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter registration link"
                            className="text-sm sm:text-base md:text-lg"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          Add a registration link for the event.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ImageUploadForm setImageUrl={setImageUrl} />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    rules={{
                      required: "Description is required",
                      minLength: {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a detailed description"
                            className="min-h-24 sm:min-h-32 text-sm sm:text-base md:text-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          Detailed description of the event item.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Is Finished */}
                  <FormField
                    control={form.control}
                    name="isFinished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                            Finished Event
                          </FormLabel>
                          <FormDescription className="text-sm sm:text-base md:text-lg">
                            Mark if this event has already taken place.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[#003366] data-[state=unchecked]:bg-gray-200"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Is Latest */}
                  <FormField
                    control={form.control}
                    name="isLatest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                            Latest Event
                          </FormLabel>
                          <FormDescription className="text-sm sm:text-base md:text-lg">
                            Feature this as the latest event item on the
                            homepage.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[#003366] data-[state=unchecked]:bg-gray-200"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              {/* Show YouTube Link if event is finished */}
              {form.watch("isFinished") && (
                <div className="px-6 pb-6 mt-8">
                  <FormField
                    control={form.control}
                    name="ytLink"
                    rules={{
                      pattern: {
                        value:
                          /^$|^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/,
                        message: "Please enter a valid YouTube URL",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                          YouTube Link
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter YouTube video URL (optional)"
                            {...field}
                            value={field.value ?? ""}
                            className="text-sm sm:text-base md:text-lg"
                          />
                        </FormControl>
                        <FormDescription className="text-sm sm:text-base md:text-lg">
                          Add a YouTube link for the event recording (optional,
                          shown only for finished events).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <CardFooter className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/events")}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 min-w-40 sm:min-w-44 md:min-w-48
      rounded-xl shadow-lg transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#003366] text-white hover:bg-[#002244] hover:text-white transition-all duration-300 rounded-xl shadow-lg text-base sm:text-lg md:text-xl lg:text-2xl font-semibold px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 min-w-40 sm:min-w-44 md:min-w-48"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update Event" : "Create Event"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}