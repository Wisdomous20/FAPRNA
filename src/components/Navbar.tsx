"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { getLatestEvent } from "@/lib/actions/event-actions";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const [latestEventTitle, setLatestEventTitle] = useState("");

  useEffect(() => {
    const fetchLatestEvent = async () => {
      const result = await getLatestEvent();
      if (!result) {
        console.log("No latest event found");
        return;
      }
      setLatestEventTitle(result!.title);
    };

    fetchLatestEvent();
  }, []);

  const mainNavItems = [
    { href: "/membership", label: "Membership" },
    { href: "/event-registration", label: "Events" },
    { href: "/about", label: "About Us" },
    { href: "/luminance", label: "Luminance" },
  ];

  const moreNavItems = [
    { href: "#contact", label: "Contact" },
    { href: "/board", label: "Executive Board Members" },
    { href: "/bylaws", label: "By Laws & Policies" },
    { href: "/documents", label: "Documents" },
  ];

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-screen-xl mx-auto flex h-32 items-center justify-center gap-6 px-4 md:px-6 lg:px-8">
        <div className="relative group flex items-center">
          <Link href="/" className="flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                <Image
                  src="/faprna_logo.png"
                  alt="FAPRNA-NV Logo"
                  width={60}
                  height={40}
                  className="mr-2 max-w-full h-auto spin-slow"
                />
                <span className="text-xl font-bold text-[#003366] relative group-item">
                  FAPRNA-NV
                </span>
              </div>
            </div>
          </Link>

          {/* Dropdown - positioned relative to the text only */}
          {/* <div className="z-10 absolute left-[62px] top-full hidden w-32 rounded-lg bg-white shadow-lg border border-gray-100 group-hover:block overflow-hidden">
            <div className="py-1">
              <Link
                href="/about"
                className="block px-4 py-3 text-sm font-bold text-[#003366] hover:bg-[#003366]/10 transition-all
                           hover:pl-6 duration-300 relative
                           before:content-[''] before:absolute before:left-2 before:top-1/2 
                           before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full 
                           before:bg-[#003366] before:opacity-0 before:transition-all 
                           before:duration-300 hover:before:opacity-100 hover:before:left-3"
              >
                About Us
              </Link>
            </div>
          </div> */}
        </div>

        <nav className="hidden md:flex items-center gap-6 lg:gap-10 flex-wrap">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-s font-bold text-[#003366] hover:text-[#003366] relative group transition-all duration-300"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#003366] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}

          {/* Enhanced More dropdown with improved hover effects */}
          <div className="group relative z-50">
            <button className="flex items-center gap-1 text-s font-bold text-[#003366] hover:text-[#003366] relative transition-all duration-300">
              More
              <ChevronRight className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#003366] transition-all duration-300 group-hover:w-[calc(100%+1rem)]"></span>
            </button>
            <div className="absolute right-0 top-full hidden w-56 rounded-lg bg-white shadow-lg group-hover:block border border-gray-100 overflow-hidden">
              <div className="py-1 space-y-1">
                {moreNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 text-sm font-bold text-[#003366] hover:bg-[#003366]/10 transition-all
                               hover:pl-6 duration-300 border-b border-gray-100 last:border-b-0 relative
                               before:content-[''] before:absolute before:left-2 before:top-1/2 
                               before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full 
                               before:bg-[#003366] before:opacity-0 before:transition-all 
                               before:duration-300 hover:before:opacity-100 hover:before:left-3"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link
            href={`/event-registration/details/${latestEventTitle}`}
            className="hidden md:block"
          >
            <Button
              className="rounded-full bg-red-600 px-6 text-white hover:bg-red-700 shadow-sm transition-all 
                            hover:shadow-md hover:scale-105 duration-300 transform"
            >
              Event Registration
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden hover:bg-[#003366]/10 
                              hover:text-[#003366] transition-colors duration-300 border-[#003366]/20"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="sm:w-80 p-0 bg-gradient-to-b from-white to-gray-50"
            >
              <SheetTitle className="sr-only">
                Mobile Navigation Menu
              </SheetTitle>
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 bg-[#003366] text-white">
                <div className="flex items-center gap-3">
                  <Image
                    src="/faprna_logo.png"
                    alt="FAPRNA-NV Logo"
                    width={32}
                    height={32}
                  />
                  <div>
                    <h2 className="text-lg font-bold">FAPRNA-NV</h2>
                    <p className="text-xs text-blue-100">Nevada Chapter</p>
                  </div>
                </div>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10 h-8 w-8"
                >
                  <X className="h-5 w-5" />
                </Button> */}
              </div>

              {/* Mobile Menu Content */}
              <div className="flex flex-col h-full">
                <nav className="flex-1 px-6 py-6">
                  {/* Main Navigation */}
                  <div className="space-y-1 mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                      Main Menu
                    </h3>
                    {mainNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between px-3 py-3 text-base font-medium text-[#003366] 
                                   hover:bg-[#003366]/5 rounded-lg transition-all duration-200 group
                                   hover:translate-x-1 active:scale-95"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#003366] transition-colors" />
                      </Link>
                    ))}
                  </div>

                  {/* <Separator className="my-6" /> */}

                  {/* More Navigation */}
                  <div className="space-y-1 mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                      More Info
                    </h3>
                    {moreNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between px-3 py-3 text-base font-medium text-[#003366] 
                                   hover:bg-[#003366]/5 rounded-lg transition-all duration-200 group
                                   hover:translate-x-1 active:scale-95"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#003366] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* Mobile CTA Button */}
                <div className="p-6 bg-white border-t">
                  <Link
                    href="/event-registration/details/MaternalandChildHealthEvent"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 
                                    text-white font-semibold shadow-lg hover:shadow-xl 
                                    hover:from-red-700 hover:to-red-800 transition-all duration-300 
                                    transform hover:scale-[1.02] active:scale-95"
                    >
                      Register for Events
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Join our upcoming events and workshops
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
