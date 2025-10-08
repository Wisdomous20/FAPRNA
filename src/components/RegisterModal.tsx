"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Calendar, DollarSign, CheckCircle, AlertCircle, User, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import type { IEvent } from "@/lib/interfaces"
import { addMemberToEvent } from "@/lib/actions/event-member-actions"

interface RegistrationFormData {
  fullName: string
  email: string
  phoneNumber?: string
  isMember: boolean
  agreeToTerms: boolean
  agreeToPhotos: boolean
}

interface EventRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  event: IEvent
}

export default function RegisterModal({ isOpen, onClose, event }: EventRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    defaultValues: {
      isMember: false,
      agreeToTerms: false,
      agreeToPhotos: false,
    },
  })

  const agreeToTerms = watch("agreeToTerms")

  const totalSteps = 3

  // Calculate registration fee
  const getRegistrationFee = () => ((watch("isMember") && event.internallyFree) ? 0 : 25);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    try {

      // add member/non-member to event
      const result = await addMemberToEvent({
        fullName: data.fullName,
        userEmail: data.email,
        eventTitle: event.title,
        isMember: data.isMember,
        phoneNumber: data.phoneNumber,
      })

      if (result && result.success) {
        // Generate confirmation number
        const confNumber = `FAPRNA-${Date.now().toString().slice(-6)}`
        setConfirmationNumber(confNumber)
        setRegistrationComplete(true)

        toast(`Your confirmation number is ${confNumber}`)

        // Redirect to Zeffy registration page if non-member
        if (!data.isMember && event.zeffyRegisterLink) {
          setTimeout(() => {
            window.open(event.zeffyRegisterLink!, "_blank")
          }, 2500) // Optional delay
        }
      } else {
        toast.error(result?.message || "Failed to register. Please try again.")
        console.log("Registration error. Please try again later. ", result?.message)
        // reset form and show error
        reset()
        setCurrentStep(1)
        setRegistrationComplete(false)
        setConfirmationNumber("")
        setValue("agreeToTerms", false)
        setValue("agreeToPhotos", false)
        setValue("isMember", false)
      }

    } catch {
      toast("Please try again or contact support.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep(1)
      setRegistrationComplete(false)
      setConfirmationNumber("")
      reset()
      onClose()
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
          >
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && <div className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
        <p className="text-gray-600">Please provide your contact details</p>
      </div>

      <div>
        <Label htmlFor="firstName" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Full Name *
        </Label>
        <Input
          id="firstName"
          {...register("fullName", { required: "Full name is required" })}
          className="mt-1"
          placeholder="Enter your full name"
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className="mt-1"
          placeholder="Enter your email address"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number *
        </Label>
        <Input
          id="phone"
          {...register("phoneNumber", { required: "Phone number is required" })}
          className="mt-1"
          placeholder="(555) 123-4567"
        />
        {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Membership & Registration</h3>
        <p className="text-gray-600">Select your membership type and provide additional details</p>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">Are you a current FAPRNA-NV Member? *</Label>
        <RadioGroup
          value={String(watch("isMember"))}
          onValueChange={(val) => setValue("isMember", val === "true")}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="true" id="is-member" />
            <Label htmlFor="is-member" className="flex-1 cursor-pointer">
              <div className="font-medium">Yes, I&apos;m a Member</div>
              <div className="text-sm text-gray-600">I am a current active FAPRNA-NV member</div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="false" id="is-not-member" />
            <Label htmlFor="is-not-member" className="flex-1 cursor-pointer">
              <div className="font-medium">No, I&apos;m a Non-Member</div>
              <div className="text-sm text-gray-600">I am not currently a member</div>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Confirm</h3>
        <p className="text-gray-600">Please review your registration details</p>
      </div>

      {/* Event Summary */}
      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Event Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span className="font-medium">{event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{event.date.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{event.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{event.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CEUs:</span>
              <span className="font-medium">{event.ceus} Credits</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Fee */}
      <Card className="border-2 border-green-100">
        <CardContent className="p-6">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Registration Fee
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Membership Type:</span>
              <span className="font-medium">{watch("isMember") ? "Member" : "Non-Member"}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className={getRegistrationFee() === 0 ? "text-green-600" : "text-blue-600"}>
                {getRegistrationFee() === 0 ? "FREE" : `$${getRegistrationFee()}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToTerms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setValue("agreeToTerms", checked as boolean)}
          />
          <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed cursor-pointer">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            . I understand that registration fees are non-refundable. *
          </Label>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToPhotos"
            {...register("agreeToPhotos")}
            onCheckedChange={(checked) => setValue("agreeToPhotos", checked as boolean)}
          />
          <Label htmlFor="agreeToPhotos" className="text-sm leading-relaxed cursor-pointer">
            I consent to being photographed/recorded during the event for promotional purposes.
          </Label>
        </div>
      </div>

      {!agreeToTerms && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You must agree to the Terms and Conditions to complete your registration.</AlertDescription>
        </Alert>
      )}
    </div>
  )

  const renderSuccessPage = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
        <p className="text-gray-600">Thank you for registering for {event.title}</p>
      </div>

      <Card className="border-2 border-green-100 bg-green-50">
        <CardContent className="p-6">
          <h4 className="font-semibold text-lg mb-2">Confirmation Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Confirmation Number:</span>
              <span className="font-mono font-bold text-green-700">{confirmationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Registration Fee:</span>
              <span className="font-semibold">{getRegistrationFee() === 0 ? "FREE" : `$${getRegistrationFee()}`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h5>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          <li>• A confirmation email has been sent to your email address</li>
          <li>• Please save your confirmation number for your records</li>
          <li>• Arrive 15 minutes early for check-in</li>
          <li>• Bring a valid ID and nursing license if applicable</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleClose} className="flex-1">
          Close
        </Button>
        <Button variant="outline" onClick={() => window.print()} className="flex-1">
          Print Confirmation
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center">
            {registrationComplete ? "Registration Complete" : "Event Registration"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {registrationComplete ? (
            renderSuccessPage()
          ) : (
            <>
              {renderStepIndicator()}

              <form onSubmit={handleSubmit(onSubmit)}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="bg-gray-400 hover:bg-gray-600"
                  >
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={nextStep} disabled={isSubmitting} className="bg-blue-800 hover:bg-blue-500">
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!agreeToTerms || isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
