"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "../utils"
import { sendNominationEmail } from "../email"
import { isNominationOpen } from "./nomination-settings-action"

const CURRENT_YEAR = new Date().getFullYear()

// Create a nomination
export async function createNomination(data: {
  nominator: { fullName: string; email: string; phone: string | null }
  nominee: { fullName: string; email: string }
  category: string
  reason: string
}) {
  try {
    console.log("Starting nomination creation process...");

    // Check if nominations are open
    const nominationOpen = await isNominationOpen();
    if (!nominationOpen) {
      return {
        success: false,
        error: "Nominations are currently closed. Please check back when nominations reopen."
      };
    }

    // Find or create nominator

    // let nominator = await prisma.member.findUnique({
    //   where: { email: data.nominator.email }
    // });

    // if (!nominator) {
    //   try {
    //     nominator = await prisma.member.create({
    //       data: {
    //         fullName: data.nominator.fullName,
    //         email: data.nominator.email,
    //         membershipStatus: "PENDING"
    //       }
    //     });
    //     console.log("Created new nominator:", nominator.id);
    //   } catch (nominatorError) {
    //     console.error("Error creating nominator:", nominatorError);
    //     return {
    //       success: false,
    //       error: "Failed to create nominator profile. Please try again."
    //     };
    //   }
    // } else {
    //   console.log("Found existing nominator:", nominator.id);
    // }

    // Find or create nominee

    // let nominee = await prisma.member.findUnique({
    //   where: { email: data.nominee.email }
    // });

    // if (!nominee) {
    //   try {
    //     nominee = await prisma.member.create({
    //       data: {
    //         fullName: data.nominee.fullName,
    //         email: data.nominee.email,
    //         membershipStatus: "PENDING"
    //       }
    //     });
    //     console.log("Created new nominee:", nominee.id);
    //   } catch (nomineeError) {
    //     console.error("Error creating nominee:", nomineeError);
    //     return {
    //       success: false,
    //       error: "Failed to create nominee profile. Please try again."
    //     };
    //   }
    // } else {
    //   console.log("Found existing nominee:", nominee.id);
    // }

    // Check if nominator already nominated someone for this category this year

    // const existingNomination = await prisma.nomination.findFirst({
    //   where: {
    //     nominatorId: nominator.id,
    //     category: data.category,
    //     year: CURRENT_YEAR
    //   },
    //   include: {
    //     nominee: {
    //       select: {
    //         fullName: true
    //       }
    //     }
    //   }
    // });

    // if (existingNomination) {
    //   console.log("Duplicate nomination detected for category:", data.category);
    //   return {
    //     success: false,
    //     error: `You have already nominated ${existingNomination.nominee?.fullName} for the ${data.category} category this year. Each person can only submit one nomination per category per year.`
    //   };
    // }

    // Create the nomination

    let nomination;

    try {
      nomination = await prisma.nominationTemp.create({
        data: {
          nomineeName: data.nominee.fullName,
          nomineeEmail: data.nominee.email,
          nominatorName: data.nominator.fullName,
          nominatorEmail: data.nominator.email,
          nominatorPhoneNumber: data.nominator.phone,
          category: data.category,
          reason: data.reason,
          status: "PENDING",
          year: CURRENT_YEAR
        },
        // include: {
        //   nominator: {
        //     select: {
        //       id: true,
        //       fullName: true,
        //       email: true
        //     }
        //   },
        //   nominee: {
        //     select: {
        //       id: true,
        //       fullName: true,
        //       email: true
        //     }
        //   }
        // }
      });
      console.log("Nomination created successfully:", nomination.id);
    } catch (createError) {
      console.error("Error creating nomination:", createError);
      return {
        success: false,
        error: "Failed to create nomination. Please try again."
      };
    }

    // Send email notification (don't fail if email fails)
    try {
      await sendNominationEmail({
        category: nomination.category,
        nominee: {
          fullName: data.nominee.fullName,
          email: data.nominee.email
        },
        nominator: {
          fullName: data.nominator.fullName,
          email: data.nominator.email
        },
        reason: nomination.reason,
        createdAt: nomination.createdAt
      });
      console.log("Email notification sent successfully");
    } catch (emailError) {
      console.error("Email notification failed (nomination still successful):", emailError);
      // Don't return error - nomination was successful even if email failed
    }

    // Revalidate paths (don't fail if revalidation fails)
    try {
      revalidatePath("/luminance");
      revalidatePath("/admin/nominations");
      console.log("Paths revalidated successfully");
    } catch (revalidateError) {
      console.error("Path revalidation failed (nomination still successful):", revalidateError);
      // Don't return error - nomination was successful even if revalidation failed
    }

    return {
      success: true,
      nomination: {
        id: nomination.id,
        category: nomination.category,
        status: nomination.status,
        nominatorName: nomination.nominatorName,
        nominee: nomination.nomineeName,
        createdAt: nomination.createdAt
      },
      message: `Nomination for ${nomination.nomineeName} in the ${data.category} category has been successfully submitted and is now under review.`
    };

  } catch (error) {
    console.error("Unexpected error in createNomination:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          error: "This nomination already exists. Please check your entries and try again."
        };
      }

      if (error.message.includes('Foreign key constraint')) {
        return {
          success: false,
          error: "Invalid member data. Please refresh the page and try again."
        };
      }

      if (error.message.includes('Connection')) {
        return {
          success: false,
          error: "Database connection error. Please try again in a moment."
        };
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again or contact support if the problem persists."
    };
  }
}

// Get all nominations for admin
export async function getAllNominations() {
  try {
    const nominations = await prisma.nominationTemp.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    return nominations
  } catch (error) {
    console.error("Failed to get nominations:", error)
    return []
  }
}

// Update nomination status
export async function updateNominationStatus(nominationId: string, status: string) {
  try {
    const updatedNomination = await prisma.nominationTemp.update({
      where: { id: nominationId },
      data: { status },
    })

    revalidatePath("/admin/nominations")
    return { success: true, nomination: updatedNomination }
  } catch (error) {
    console.error("Failed to update nomination status:", error)
    return { success: false, error: "Failed to update nomination status" }
  }
}

// Get nomination statistics
export async function getNominationStats() {
  try {
    const [total, pending, approved, rejected, categoryStats] = await Promise.all([
      prisma.nomination.count(),
      prisma.nomination.count({ where: { status: "PENDING" } }),
      prisma.nomination.count({ where: { status: "APPROVED" } }),
      prisma.nomination.count({ where: { status: "REJECTED" } }),
      prisma.nomination.groupBy({
        by: ["category"],
        _count: {
          category: true,
        },
      }),
    ])

    const categories = categoryStats.reduce(
      (acc, stat) => {
        acc[stat.category] = stat._count.category
        return acc
      },
      {} as { [key: string]: number },
    )

    return {
      total,
      pending,
      approved,
      rejected,
      categories,
    }
  } catch (error) {
    console.error("Failed to fetch nomination stats:", error)
    throw new Error("Failed to fetch nomination stats")
  }
}

// Get nomination by ID
export async function getNominationById(id: string) {
  try {
    const nomination = await prisma.nomination.findUnique({
      where: { id },
      include: {
        nominator: true,
        nominee: true
      }
    })

    return nomination
  } catch (error) {
    console.error("Failed to get nomination:", error)
    return null
  }
}

// Get eligible members for nomination
export async function getEligibleMembers() {
  try {
    const members = await prisma.member.findMany({
      where: {
        membershipStatus: "APPROVED"
      },
      select: {
        id: true,
        fullName: true,
        email: true
      },
      orderBy: {
        fullName: "asc"
      }
    })

    return members
  } catch (error) {
    console.error("Failed to get eligible members:", error)
    return []
  }
}