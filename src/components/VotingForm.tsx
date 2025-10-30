"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Send, Award, Star, Crown, Medal, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createNomination } from "@/lib/actions/nomination-actions";
import { toast } from "sonner";

const categories = [
  {
    id: "intentionality",
    title: "ADVANCEMENT OF INTENTIONALITY",
    description:
      "An APRN people in fields and specialization who demonstrates clear direction and projection of career ladder including but not limited to Academia.",
    icon: <Star className="w-5 h-5" />,
  },
  {
    id: "inquiry",
    title: "ADVANCEMENT IN INQUIRY",
    description:
      "An APRN who excels in knowledge discovery, utilization and implementation including but not limited to research and evidence based practice.",
    icon: <Star className="w-5 h-5" />,
  },
  {
    id: "impact",
    title: "ADVANCEMENT WITH IMPACT",
    description:
      "An APRN who excels in any fields of specialization leading to change in practice, knowledge and policy, creating a novel advancement in overall outcome in advance practice nursing discipline and beyond.",
    icon: <Award className="w-5 h-5" />,
  },
];

const FloatingParticles = () => {
  const [particles, setParticles] = useState<
    {
      size: number;
      top: number;
      left: number;
      delay: number;
      duration: number;
    }[]
  >([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map(() => ({
      size: Math.random() * 30 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 15,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: particle.size + "px",
            height: particle.size + "px",
            top: particle.top + "%",
            left: particle.left + "%",
            animationDelay: particle.delay + "s",
            animationDuration: particle.duration + "s",
            backgroundColor: "rgba(212, 175, 55, 0.3)",
            filter: "blur(1px)",
          }}
        ></div>
      ))}
    </div>
  );
};

export default function VotingForm() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nomineeName: "",
    nomineeEmail: "",
    nominatorName: "",
    nominatorEmail: "",
    nominatorPhoneNumber: "",
    reason: "",
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedCategory ||
      !formData.agreeTerms ||
      !formData.nomineeName ||
      !formData.nomineeEmail
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const nominationData = {
        nominator: {
          fullName: formData.nominatorName,
          email: formData.nominatorEmail,
          phone: formData.nominatorPhoneNumber,
        },
        nominee: {
          fullName: formData.nomineeName,
          email: formData.nomineeEmail,
        },
        category: selectedCategory,
        reason: formData.reason,
      };

      const result = await createNomination(nominationData);

      if (result.success) {
        toast.success("🎉 Nomination submitted successfully!", {
          description: `Your nomination for ${formData.nomineeName} has been submitted for review.`,
          duration: 5000,
        });

        setSelectedCategory("");
        setFormData({
          nomineeName: "",
          nomineeEmail: "",
          nominatorName: "",
          nominatorEmail: "",
          nominatorPhoneNumber: "",
          reason: "",
          agreeTerms: false,
        });
      } else {
        if (result.error?.includes("already nominated")) {
          toast.error("⚠️ You have already nominated someone for this category", {
            description:
              "Each person can only submit one nomination per category per year.",
            duration: 6000,
          });
        } else if (result.error?.includes("closed")) {
          toast.error("❌ Nominations are currently closed", {
            description: "Please check back when nominations reopen.",
            duration: 5000,
          });
        } else {
          toast.error("❌ Failed to submit nomination", {
            description: result.error || "Please try again.",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("❌ Something went wrong", {
        description: "Please try again or contact support.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.15), transparent 40%)",
        }}
      ></div>

      <FloatingParticles />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <Button
              asChild
              variant="outline"
              className="transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
              style={{
                background:
                  "linear-gradient(45deg, #FFD700, #FFA500, #DAA520, #FFD700)",
                backgroundSize: "300% 300%",
                animation: "gradient-shift 3s ease infinite",
                color: "black",
                boxShadow:
                  "0 0 30px 0 rgba(255, 215, 0, 0.7), 0 10px 30px rgba(255, 215, 0, 0.3)",
                border: "2px solid #FFD700",
              }}
            >
              <Link href="/luminance?noTransition=true">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Awards
              </Link>
            </Button>
          </div>

          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Crown
                className="w-12 h-12 animate-fade-in-up"
                style={{
                  color: "#FFD700",
                  filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
                }}
              />
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold mb-2 animate-fade-in-up"
              style={{
                background:
                  "linear-gradient(to right, #D4AF37, #FFD700, #D4AF37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 10px rgba(212, 175, 55, 0.3)",
              }}
            >
              LUMINANCE NOMINATION
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Recognize excellence in Filipino-American advanced practice nursing by nominating a deserving colleague
            </p>
          </div>

          <div
            className="h-1 w-32 mx-auto rounded-full animate-fade-in-up animation-delay-300"
            style={{
              background:
                "linear-gradient(to right, transparent, #D4AF37, transparent)",
            }}
          ></div>
        </div>

        <Card
          className="overflow-hidden p-0"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            borderColor: "#D4AF37",
            borderWidth: "1px",
            boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.2)",
          }}
        >
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Sidebar */}
              <div
                className="p-6 md:p-8"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(15, 15, 15, 0.95))",
                  borderRight: "1px solid rgba(212, 175, 55, 0.2)",
                }}
              >
                <div className="space-y-6">
                  <div>
                    <h3
                      className="text-xl font-semibold mb-2 flex items-center"
                      style={{ color: "#D4AF37" }}
                    >
                      <Medal className="w-5 h-5 mr-2" style={{ color: "#D4AF37" }} />
                      Nomination Process
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                      <li>1. Select an award category</li>
                      <li>2. Provide nominee information</li>
                      <li>3. Explain why they deserve recognition</li>
                      <li>4. Submit your nomination</li>
                    </ul>
                  </div>
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: "rgba(212, 175, 55, 0.1)" }}
                  >
                    <p className="text-sm text-gray-300 italic">
                      &quot;Recognition of excellence inspires future generations to pursue greatness.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="col-span-2 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Category Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center" style={{ color: "#D4AF37" }}>
                      <Award className="w-5 h-5 mr-2" style={{ color: "#D4AF37" }} />
                      1. Select Award Category
                    </h3>
                    <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                      <div className="grid gap-4">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="relative rounded-lg transition-all duration-300"
                            style={{
                              backgroundColor:
                                selectedCategory === category.id ? "rgba(212, 175, 55, 0.1)" : "transparent",
                              borderWidth: "1px",
                              borderColor:
                                selectedCategory === category.id ? "#D4AF37" : "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="flex items-start p-4">
                              <RadioGroupItem
                                value={category.id}
                                id={category.id}
                                className="mt-1"
                                style={{
                                  borderColor:
                                    selectedCategory === category.id ? "#D4AF37" : "#6b7280",
                                }}
                              />
                              <div className="ml-3">
                                <Label
                                  htmlFor={category.id}
                                  className="font-medium text-base cursor-pointer flex items-center"
                                  style={{
                                    color:
                                      selectedCategory === category.id
                                        ? "#D4AF37"
                                        : "#e5e7eb",
                                  }}
                                >
                                  <span className="mr-2" style={{ color: "#D4AF37" }}>
                                    {category.icon}
                                  </span>
                                  {category.title}
                                </Label>
                                <p className="text-sm mt-1 text-gray-400">
                                  {category.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Nominee Info */}
                  <div className="space-y-4">
                    <h3
                      className="text-xl font-semibold flex items-center"
                      style={{ color: "#D4AF37" }}
                    >
                      <User className="w-5 h-5 mr-2" style={{ color: "#D4AF37" }} />
                      2. Nominee Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nomineeName" className="text-gray-300 text-sm">
                          Nominee Name
                        </Label>
                        <Input
                          id="nomineeName"
                          value={formData.nomineeName}
                          onChange={(e) => handleInputChange("nomineeName", e.target.value)}
                          placeholder="Enter nominee's full name"
                          className="bg-transparent border-gray-700 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="nomineeEmail" className="text-gray-300 text-sm">
                          Nominee Email
                        </Label>
                        <Input
                          id="nomineeEmail"
                          type="email"
                          value={formData.nomineeEmail}
                          onChange={(e) => handleInputChange("nomineeEmail", e.target.value)}
                          placeholder="Enter nominee's email"
                          className="bg-transparent border-gray-700 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center" style={{ color: "#D4AF37" }}>
                      <Star className="w-5 h-5 mr-2" style={{ color: "#D4AF37" }} />
                      3. Reason for Nomination
                    </h3>
                    <div
                      className="rounded-lg p-4"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        borderWidth: "1px",
                        borderColor: "rgba(212, 175, 55, 0.3)",
                      }}
                    >
                      <Textarea
                        placeholder="In 300 words explain why this nominee deserves this award..."
                        value={formData.reason}
                        onChange={(e) => handleInputChange("reason", e.target.value)}
                        className="min-h-32 bg-transparent border-gray-700 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                        maxLength={300}
                        required
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>Be specific about their achievements and impact</span>
                        <span>{formData.reason.length}/300</span>
                      </div>
                    </div>
                  </div>

                  {/* Nominator Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center" style={{ color: "#D4AF37" }}>
                      <Award className="w-5 h-5 mr-2" style={{ color: "#D4AF37" }} />
                      4. Your Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nominatorName" className="text-gray-300 text-sm">
                          Your Name
                        </Label>
                        <Input
                          id="nominatorName"
                          value={formData.nominatorName}
                          onChange={(e) => handleInputChange("nominatorName", e.target.value)}
                          className="bg-transparent border-gray-700 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="nominatorEmail" className="text-gray-300 text-sm">
                          Your Email
                        </Label>
                        <Input
                          id="nominatorEmail"
                          type="email"
                          value={formData.nominatorEmail}
                          onChange={(e) => handleInputChange("nominatorEmail", e.target.value)}
                          className="bg-transparent border-gray-700 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="nominatorPhone" className="text-gray-300 text-sm">
                        Your Phone Number
                      </Label>
                      <Input
                        id="nominatorPhone"
                        type="tel"
                        value={formData.nominatorPhoneNumber}
                        onChange={(e) => handleInputChange("nominatorPhone", e.target.value)}
                        placeholder="Optional"
                        className="bg-transparent border-gray-700 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                      />
                    </div>
                  </div>

                  {/* Agreement */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) =>
                        handleInputChange("agreeTerms", !!checked)
                      }
                      className="border-gray-600 text-[#D4AF37] focus:ring-[#D4AF37]/20"
                      required
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-gray-400 leading-tight"
                    >
                      I confirm that the information provided is accurate and
                      that I am submitting this nomination in good faith.
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 text-lg font-semibold transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(45deg, #FFD700, #FFA500, #DAA520, #FFD700)",
                        backgroundSize: "300% 300%",
                        animation: "gradient-shift 3s ease infinite",
                        color: "black",
                        boxShadow:
                          "0 0 30px 0 rgba(255, 215, 0, 0.7), 0 10px 30px rgba(255, 215, 0, 0.3)",
                        border: "2px solid #FFD700",
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Nomination"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
