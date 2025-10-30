"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Award,
  Calendar,
  Settings,
  Play,
  Square,
  Plus,
  Check,
  X,
  Search,
  RefreshCw,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  getNominationSettings,
  toggleNomination,
  createNominationYear,
  getNominationStats,
} from "@/lib/actions/nomination-settings-action";
import {
  getAllNominations,
  updateNominationStatus,
} from "@/lib/actions/nomination-actions";
import { NominationTemp } from "@/lib/interfaces";

interface NominationSettings {
  id: string;
  year: number;
  isNominationOpen: boolean;
  nominationStartDate: Date | null;
  nominationEndDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// interface Nomination {
//   id: string;
//   nominee: {
//     fullName: string;
//     email: string;
//   } | null;
//   nominator: {
//     fullName: string;
//     email: string;
//   } | null;
//   category: string;
//   createdAt: string | Date;
//   status: "PENDING" | "APPROVED" | "REJECTED";
//   reason: string;
//   year: number;
// }

interface NominationStats {
  totalNominations: number;
  categories: {
    intentionality: number;
    inquiry: number;
    impact: number;
    [key: string]: number;
  };
}

export default function NominationManagement() {
  const [stats, setStats] = useState<NominationStats>({
    totalNominations: 0,
    categories: {
      intentionality: 0,
      inquiry: 0,
      impact: 0,
    },
  });
  const [settings, setSettings] = useState<NominationSettings | null>(null);
  // const [nominationYears, setNominationYears] = useState<NominationSettings[]>([]);
  const [nominations, setNominations] = useState<NominationTemp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [newYear, setNewYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, nominationsData, statsData] = await Promise.all([
        getNominationSettings(),
        getAllNominations(),
        getNominationStats(),
      ]);

      setSettings(settingsData);
      setNominations(
        nominationsData.map((nom) => ({
          ...nom,
          status: nom.status as "PENDING" | "APPROVED" | "REJECTED",
        }))
      );
      setStats({
        ...statsData,
        categories: {
          intentionality: statsData.categories.intentionality ?? 0,
          inquiry: statsData.categories.inquiry ?? 0,
          impact: statsData.categories.impact ?? 0,
          ...statsData.categories,
        },
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load nomination data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNomination = async (isOpen: boolean) => {
    setIsToggling(true);
    try {
      const result = await toggleNomination(isOpen);

      if (result.success) {
        toast.success(isOpen ? "Nominations opened!" : "Nominations closed!");
        await fetchData();
      } else {
        toast.error(result.error || "Failed to toggle nominations");
      }
    } catch (error) {
      console.error("Failed to toggle nominations:", error);
      toast.error("Failed to toggle nominations");
    } finally {
      setIsToggling(false);
    }
  };

  const handleCreateYear = async () => {
    if (!newYear || isNaN(parseInt(newYear))) {
      toast.error("Please enter a valid year");
      return;
    }

    try {
      const result = await createNominationYear(parseInt(newYear));

      if (result.success) {
        toast.success(`Nomination year ${newYear} created!`);
        setNewYear("");
        await fetchData();
      } else {
        toast.error(result.error || "Failed to create nomination year");
      }
    } catch (error) {
      console.error("Failed to create year:", error);
      toast.error("Failed to create nomination year");
    }
  };

  const handleUpdateStatus = async (nominationId: string, status: string) => {
    try {
      const result = await updateNominationStatus(nominationId, status);

      if (result.success) {
        toast.success(`Nomination ${status.toLowerCase()}!`);
        await fetchData();
      } else {
        toast.error(result.error || "Failed to update nomination");
      }
    } catch (error) {
      console.error("Failed to update nomination:", error);
      toast.error("Failed to update nomination");
    }
  };

  const getCategoryTitle = (category: string) => {
    const titles = {
      intentionality: "ADVANCEMENT OF INTENTIONALITY",
      inquiry: "ADVANCEMENT IN INQUIRY",
      impact: "ADVANCEMENT WITH IMPACT",
    };
    return titles[category as keyof typeof titles] || category;
  };

  const getStatusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5">
            Pending
          </Badge>
        );
    }
  };

  const filteredNominations = nominations.filter((nomination) => {
    return (
      nomination.nomineeName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      nomination.nominatorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getCategoryTitle(nomination.category)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const pendingCount = nominations.filter(
    (nom) => nom.status === "PENDING"
  ).length;
  const approvedCount = nominations.filter(
    (nom) => nom.status === "APPROVED"
  ).length;
  const rejectedCount = nominations.filter(
    (nom) => nom.status === "REJECTED"
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="w-full py-4 sm:py-6 md:py-8 lg:py-12 min-h-screen px-4 sm:px-6 md:px-8"
      style={{ background: "#003366" }}
    >
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white drop-shadow-lg">
            Nomination Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mt-2 sm:mt-3 font-semibold drop-shadow">
            Manage nominations and award settings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 grid gap-4 sm:gap-6 md:gap-8 grid-cols-2 lg:grid-cols-4">
        <Card className="p-2 sm:p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
              Total Nominations
            </CardTitle>
            <Award className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold">
              {stats.totalNominations || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
              Pending
            </CardTitle>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-yellow-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
              Approved
            </CardTitle>
            <Check className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-green-600">
              {approvedCount}
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
              Rejected
            </CardTitle>
            <X className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-red-600">
              {rejectedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Stats */}
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-600">
                  Intentionality
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  {stats.categories?.intentionality || 0}
                </p>
              </div>
              <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-600">
                  Inquiry
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  {stats.categories?.inquiry || 0}
                </p>
              </div>
              <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-600">
                  Impact
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  {stats.categories?.impact || 0}
                </p>
              </div>
              <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Nomination Status */}
      <Card className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 p-2 sm:p-3 md:p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            <Award className="w-5 h-5" />
            Current Nomination Status ({settings?.year})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                  Nomination Period
                </Label>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600">
                  {settings?.isNominationOpen
                    ? "Nominations are currently open"
                    : "Nominations are currently closed"}
                </p>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                <Badge
                  className={`text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 ${
                    settings?.isNominationOpen
                      ? "bg-green-600 text-white hover:bg-green-600"
                      : "bg-red-600 text-white hover:bg-red-600"
                  }`}
                >
                  {settings?.isNominationOpen ? "Open" : "Closed"}
                </Badge>
                <Switch
                  checked={settings?.isNominationOpen || false}
                  onCheckedChange={handleToggleNomination}
                  disabled={isToggling}
                  className="scale-100 sm:scale-110 md:scale-125 lg:scale-150 data-[state=checked]:bg-[#003366] data-[state=unchecked]:bg-[#003366]"
                />
              </div>
            </div>

            {settings?.isNominationOpen && (
              <div className="bg-green-50 p-4 sm:p-5 md:p-6 lg:p-6 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-3 mb-2 sm:mb-3 md:mb-3">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 text-green-600" />
                  <span className="font-medium text-sm sm:text-base md:text-lg lg:text-xl text-green-800">
                    Nominations Active
                  </span>
                </div>
                <p className="text-sm sm:text-base md:text-lg lg:text-lg text-green-700">
                  Started:{" "}
                  {settings.nominationStartDate
                    ? format(
                        new Date(settings.nominationStartDate),
                        "PPP 'at' p"
                      )
                    : "Unknown"}
                </p>
              </div>
            )}

            {!settings?.isNominationOpen && settings?.nominationEndDate && (
              <div className="bg-red-50 p-4 sm:p-5 md:p-6 lg:p-6 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-3 mb-2 sm:mb-3 md:mb-3">
                  <Square className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 text-red-600" />
                  <span className="font-medium text-sm sm:text-base md:text-lg lg:text-xl text-red-800">
                    Nominations Closed
                  </span>
                </div>
                <p className="text-sm sm:text-base md:text-lg lg:text-lg text-red-700">
                  Ended:{" "}
                  {format(new Date(settings.nominationEndDate), "PPP 'at' p")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
        <Card className="p-2 sm:p-3 md:p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 md:space-y-6">
            <Button
              onClick={() =>
                handleToggleNomination(!settings?.isNominationOpen)
              }
              disabled={isToggling}
              className="w-full gap-2 sm:gap-3 h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 text-sm sm:text-base md:text-lg bg-[#003366] text-white font-semibold hover:bg-[#002244] hover:text-white transition-all duration-300 rounded-xl shadow-lg"
            >
              {settings?.isNominationOpen ? (
                <>
                  <Square className="w-4 h-4" />
                  Close Nominations
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Open Nominations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              <Calendar className="w-5 h-5" />
              Create New Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="2026"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                min="2020"
                max="2030"
                className="h-10 sm:h-11 md:h-12 text-sm sm:text-base md:text-lg"
              />
              <Button
                onClick={handleCreateYear}
                disabled={!newYear}
                className="gap-2 sm:gap-3 h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 text-sm sm:text-base md:text-lg bg-[#003366] text-white font-semibold hover:bg-[#002244] hover:text-white transition-all duration-300 rounded-xl shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nominations Table */}
      <Card className="p-2 sm:p-3 md:p-4">
        <CardHeader className="pb-4 sm:pb-5 md:pb-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            All Nominations
          </CardTitle>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
            Review and manage nomination requests
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:gap-6">
            <div className="relative w-full">
              <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-500" />
              <Input
                placeholder="Search nominations..."
                className="pl-10 sm:pl-12 md:pl-14 h-10 sm:h-11 md:h-12 text-sm sm:text-base md:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={fetchData}
                className="gap-2 sm:gap-3 h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 text-sm sm:text-base md:text-lg order-2 sm:order-1 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredNominations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No nominations found
              </p>
            ) : (
              filteredNominations.map((nomination) => (
                <div key={nomination.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                        {nomination.nomineeName}
                      </h4>
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
                        {getCategoryTitle(nomination.category)}
                      </p>
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500">
                        Nominated by {nomination.nominatorName} •{" "}
                        {format(new Date(nomination.createdAt), "PPP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(nomination.status as "PENDING" | "APPROVED" | "REJECTED")}
                      {nomination.status === "PENDING" && (
                        <div className="flex gap-2 sm:gap-3">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(nomination.id, "APPROVED")
                            }
                            className="bg-green-600 hover:bg-green-700 h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11"
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleUpdateStatus(nomination.id, "REJECTED")
                            }
                            className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mt-2">
                    {nomination.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
