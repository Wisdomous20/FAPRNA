import { EventType } from "@/generated/prisma";
import { $Enums } from "@/generated/prisma";

export interface IEvent {
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
  ytLink?: string | null;
  zeffyRegisterLink?: string | null
  expected_attendees: number;
  internallyFree: boolean;
  createdAt: Date;
  updatedAt: Date
  isFinished: boolean;
  isLatest: boolean;
}

export interface Nomination {
  id: string
  nominatorId: string | null
  nomineeId: string | null
  createdAt: Date
  updatedAt: Date
  category: string
  reason: string
  status: string
  nominator: {
    id: string
    fullName: string
    email: string
  } | null
  nominee: {
    id: string
    fullName: string
    email: string
  } | null
}

export interface NominationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  categories: { [key: string]: number }
}

export interface EventRegistrationStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface EventRegistration {
  id: string
  memberId: string | null
  nonMemberId: string | null
  eventId: string
  isPending: boolean
  rejected: boolean
  member: RegisterMember | null
  nonMember: RegisterNonMember | null
}

export interface RegisterMember {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  membershipStatus: $Enums.MembershipStatus
}

export interface RegisterNonMember {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
}

export interface Member {
  fullName: string
  email: string
  phone: string
}

export interface NominationForm {
  nominator: Member
  nominee: Member
  reason: string
  category: string
}