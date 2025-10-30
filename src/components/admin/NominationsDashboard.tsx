"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Eye,
  Check,
  X,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Award,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  getAllNominations,
  updateNominationStatus,
  getNominationStats,
} from "@/lib/actions/nomination-actions";
import { NominationTemp, NominationStats } from "@/lib/interfaces";

export default function NominationsAdminDashboard() {
  const [nominations, setNominations] = useState<NominationTemp[]>([]);
  const [stats, setStats] = useState<NominationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  // Fetch nominations data
  const fetchNominations = async () => {
    setIsLoading(true);
    try {
      const [nominationsData, statsData] = await Promise.all([
        getAllNominations(),
        getNominationStats(),
      ]);
      if (nominationsData.length === 0) {
        toast("No nominations found");
        setNominations([]);
        setStats(null);
      } else {
        console.log("Fetched nominations:", nominationsData);
        toast("Nominations fetched successfully");
        setNominations(nominationsData);
      }
      setStats(statsData);
    } catch (error) {
      console.log("Error: ", error);
      toast("Failed to fetch nominations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNominations();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateNominationStatus(id, status);
      toast(`Nomination ${status.toLowerCase()} successfully`);
      fetchNominations();
    } catch (error) {
      console.error("Error: ", error);
      toast("Failed to update nomination status");
    }
  };

  // Filter nominations based on search query and active tab
  const filteredNominations = nominations.filter((nomination) => {
    const matchesSearch =
      nomination.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nomination.nominatorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      nomination.nomineeName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      nomination.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending")
      return matchesSearch && nomination.status === "PENDING";
    if (activeTab === "approved")
      return matchesSearch && nomination.status === "APPROVED";
    if (activeTab === "rejected")
      return matchesSearch && nomination.status === "REJECTED";

    return matchesSearch;
  });

  // Get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1"
          >
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1"
          >
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1"
          >
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1"
          >
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div
      className="w-full py-4 sm:py-6 md:py-8 lg:py-12 min-h-screen px-4 sm:px-6 md:px-8"
      style={{ background: "#003366" }}
    >
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white drop-shadow-lg">
            Nominations Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mt-2 sm:mt-3 font-semibold drop-shadow">
            Review and manage user nominations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
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
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card className="p-2 sm:p-3 md:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 md:pb-4">
              <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
                Pending Review
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
              <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
                Approved
              </CardTitle>
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
              <CardTitle className="text-xs sm:text-sm md:text-base lg:text-xl font-bold">
                Rejected
              </CardTitle>
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

      <Card className="p-2 sm:p-3 md:p-4 m">
        <CardHeader className="pb-4 sm:pb-5 md:pb-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            Nominations Dashboard
          </CardTitle>
          <CardDescription className="text-sm sm:text-base md:text-lg lg:text-xl">
            Review, approve, or reject user nominations. Click on a nomination
            to see full details.
          </CardDescription>
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
                onClick={fetchNominations}
                className="gap-2 sm:gap-3 h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 text-sm sm:text-base md:text-lg order-2 sm:order-1"
              >
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 sm:gap-3 h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 text-sm sm:text-base md:text-lg order-1 sm:order-2"
                  >
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 sm:w-56 md:w-64"
                >
                  <DropdownMenuLabel className="text-sm sm:text-base md:text-lg">
                    Filter by Status
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setActiveTab("all")}
                    className="text-xs sm:text-sm md:text-base py-2 sm:py-3"
                  >
                    All Nominations
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveTab("pending")}
                    className="text-xs sm:text-sm md:text-base py-2 sm:py-3"
                  >
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveTab("approved")}
                    className="text-xs sm:text-sm md:text-base py-2 sm:py-3"
                  >
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveTab("rejected")}
                    className="text-xs sm:text-sm md:text-base py-2 sm:py-3"
                  >
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6 sm:mb-8 grid w-full grid-cols-2 sm:grid-cols-4 h-10 sm:h-12 md:h-14">
              <TabsTrigger
                value="all"
                className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold"
              >
                Rejected
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="rounded-lg sm:rounded-xl border shadow-sm overflow-hidden">
                {/* Mobile Cards View */}
                <div className="block lg:hidden">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="text-base sm:text-lg">
                        Loading nominations...
                      </div>
                    </div>
                  ) : filteredNominations.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-base sm:text-lg">
                        No nominations found.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4">
                      {filteredNominations.map((nomination) => (
                        <Card key={nomination.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Award className="h-4 w-4 text-blue-500" />
                                <h3 className="font-semibold text-sm">
                                  {nomination.category}
                                </h3>
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div>
                                  Nominator: {nomination.nominatorName}
                                </div>
                                <div>
                                  Nominee: {nomination.nomineeName}
                                </div>
                                <div>
                                  {format(
                                    new Date(nomination.createdAt),
                                    "MMM d, yyyy"
                                  )}
                                </div>
                                <div>{getStatusBadge(nomination.status)}</div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/admin/nominations/${nomination.id}`
                                  )
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {nomination.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        nomination.id,
                                        "APPROVED"
                                      )
                                    }
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        nomination.id,
                                        "REJECTED"
                                      )
                                    }
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Category
                        </TableHead>
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Nominator
                        </TableHead>
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Primary Nominee
                        </TableHead>
                        <TableHead className="text-sm md:text-base lg:text-lg font-bold py-3 md:py-4">
                          Date Submitted
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
                            Loading nominations...
                          </TableCell>
                        </TableRow>
                      ) : filteredNominations.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 sm:h-32 text-center text-base sm:text-lg md:text-xl"
                          >
                            No nominations found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNominations.map((nomination) => (
                          <TableRow
                            key={nomination.id}
                            className="hover:bg-gray-50/50"
                          >
                            <TableCell className="font-semibold py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
                                <span className="text-sm sm:text-base md:text-lg">
                                  {nomination.category}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-500" />
                                <div>
                                  <div className="font-semibold text-sm sm:text-base md:text-lg">
                                    {nomination.nominatorName}
                                  </div>
                                  <div className="text-xs sm:text-sm md:text-base text-gray-500">
                                    {nomination.nominatorEmail}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-500" />
                                <div>
                                  <div className="font-semibold text-sm sm:text-base md:text-lg">
                                    {nomination.nomineeName}
                                  </div>
                                  <div className="text-xs sm:text-sm md:text-base text-gray-500">
                                    {nomination.nomineeEmail}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-500" />
                                <span className="text-sm sm:text-base md:text-lg">
                                  {format(
                                    new Date(nomination.createdAt),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 sm:py-4 md:py-5">
                              {getStatusBadge(nomination.status)}
                            </TableCell>
                            <TableCell className="text-right py-3 sm:py-4 md:py-5">
                              <div className="flex justify-end gap-1 sm:gap-2 md:gap-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                                  onClick={() =>
                                    router.push(
                                      `/admin/nominations/${nomination.id}`
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                </Button>
                                {nomination.status === "PENDING" && (
                                  <>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                                        >
                                          <Check className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="max-w-sm sm:max-w-md md:max-w-lg">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-lg sm:text-xl md:text-2xl">
                                            Approve Nomination
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-sm sm:text-base md:text-lg">
                                            Are you sure you want to approve
                                            this nomination for{" "}
                                            {nomination.category}?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-2 sm:gap-3">
                                          <AlertDialogCancel className="text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-2 sm:py-3">
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-green-600 text-white hover:bg-green-700 text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-2 sm:py-3"
                                            onClick={() =>
                                              handleStatusUpdate(
                                                nomination.id,
                                                "APPROVED"
                                              )
                                            }
                                          >
                                            Approve
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                                        >
                                          <X className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="max-w-sm sm:max-w-md md:max-w-lg">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-lg sm:text-xl md:text-2xl">
                                            Reject Nomination
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-sm sm:text-base md:text-lg">
                                            Are you sure you want to reject this
                                            nomination for {nomination.category}
                                            ?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-2 sm:gap-3">
                                          <AlertDialogCancel className="text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-2 sm:py-3">
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 text-white hover:bg-red-700 text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-2 sm:py-3"
                                            onClick={() =>
                                              handleStatusUpdate(
                                                nomination.id,
                                                "REJECTED"
                                              )
                                            }
                                          >
                                            Reject
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
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
