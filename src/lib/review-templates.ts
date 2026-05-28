export type IndustryTemplateKey =
  | "restaurant"
  | "hvac"
  | "locksmith"
  | "plumbing"
  | "electrician"
  | "cleaning"
  | "auto_repair"
  | "beauty"
  | "medical"
  | "real_estate"
  | "legal"
  | "general";

export type IndustryTemplate = {
  key: IndustryTemplateKey;
  label: string;
  serviceCategories: string[];
};

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    key: "restaurant",
    label: "Restaurant / Food Service",
    serviceCategories: [
      "Food Quality",
      "Customer Service",
      "Speed of Service",
      "Cleanliness",
      "Takeout / Pickup",
      "Delivery Experience",
      "Atmosphere",
      "Value for Price",
    ],
  },
  {
    key: "hvac",
    label: "HVAC",
    serviceCategories: [
      "AC Repair",
      "Heating Repair",
      "Maintenance Tune-Up",
      "New Installation",
      "Emergency Service",
      "Technician Professionalism",
      "Scheduling / Arrival Time",
      "Pricing / Estimate",
    ],
  },
  {
    key: "locksmith",
    label: "Locksmith",
    serviceCategories: [
      "Lockout Service",
      "Rekeying",
      "Lock Repair",
      "New Lock Installation",
      "Car Key / Auto Locksmith",
      "Emergency Response Time",
      "Technician Professionalism",
      "Pricing / Estimate",
    ],
  },
  {
    key: "plumbing",
    label: "Plumbing",
    serviceCategories: [
      "Drain Cleaning",
      "Leak Repair",
      "Water Heater Service",
      "Toilet / Faucet Repair",
      "Emergency Service",
      "Technician Professionalism",
      "Scheduling / Arrival Time",
      "Pricing / Estimate",
    ],
  },
  {
    key: "electrician",
    label: "Electrician",
    serviceCategories: [
      "Electrical Repair",
      "Panel / Breaker Work",
      "Outlet / Switch Installation",
      "Lighting Installation",
      "Troubleshooting",
      "Emergency Service",
      "Technician Professionalism",
      "Pricing / Estimate",
    ],
  },
  {
    key: "cleaning",
    label: "Cleaning Service",
    serviceCategories: [
      "Standard Cleaning",
      "Deep Cleaning",
      "Move-In / Move-Out Cleaning",
      "Office Cleaning",
      "Scheduling / Arrival Time",
      "Attention to Detail",
      "Staff Professionalism",
      "Value for Price",
    ],
  },
  {
    key: "auto_repair",
    label: "Auto Repair",
    serviceCategories: [
      "Oil Change / Maintenance",
      "Brake Service",
      "Engine / Diagnostic",
      "Tire Service",
      "Customer Service",
      "Speed of Service",
      "Pricing / Estimate",
      "Quality of Repair",
    ],
  },
  {
    key: "beauty",
    label: "Beauty / Salon / Spa",
    serviceCategories: [
      "Haircut / Styling",
      "Color Service",
      "Nails",
      "Facial / Skin Care",
      "Massage / Spa Service",
      "Customer Service",
      "Cleanliness",
      "Staff Professionalism",
    ],
  },
  {
    key: "medical",
    label: "Medical / Dental / Wellness",
    serviceCategories: [
      "Front Desk Experience",
      "Provider Care",
      "Appointment Scheduling",
      "Wait Time",
      "Communication",
      "Cleanliness",
      "Billing / Insurance",
      "Overall Patient Experience",
    ],
  },
  {
    key: "real_estate",
    label: "Real Estate",
    serviceCategories: [
      "Communication",
      "Market Knowledge",
      "Negotiation",
      "Showing Experience",
      "Listing Process",
      "Buying Process",
      "Selling Process",
      "Overall Client Experience",
    ],
  },
  {
    key: "legal",
    label: "Legal / Professional Services",
    serviceCategories: [
      "Communication",
      "Professionalism",
      "Responsiveness",
      "Consultation Experience",
      "Document Preparation",
      "Case Updates",
      "Office Experience",
      "Overall Service Experience",
    ],
  },
  {
    key: "general",
    label: "General Local Business",
    serviceCategories: [
      "Customer Service",
      "Speed of Service",
      "Staff Professionalism",
      "Communication",
      "Quality of Work",
      "Cleanliness",
      "Pricing / Value",
      "Overall Experience",
    ],
  },
];

export function getIndustryTemplateByKey(key: string | null | undefined) {
  return (
    INDUSTRY_TEMPLATES.find((template) => template.key === key) ??
    INDUSTRY_TEMPLATES.find((template) => template.key === "general")!
  );
}

export function generateReviewSuggestions({
  businessName,
  serviceDescription,
  helperName,
}: {
  businessName: string;
  serviceDescription: string;
  helperName: string;
}) {
  const service =
    serviceDescription.trim().length > 0
      ? serviceDescription
      : "the service";

  const helper =
    helperName.trim().length > 0 ? ` ${helperName}` : "";

  return [
    `Great experience with ${businessName}.${helper ? `${helper} was extremely helpful and professional.` : ""} Highly recommend them for ${service}.`,

    `${businessName} did an amazing job with ${service}.${helper ? `${helper} made the process smooth and easy.` : ""} Would definitely use them again.`,

    `Very happy with my experience at ${businessName}.${helper ? `${helper} provided excellent customer service.` : ""} Fast, professional, and easy to work with.`,

    `${businessName} exceeded my expectations.${helper ? `${helper} was friendly, knowledgeable, and professional.` : ""} I would absolutely recommend them for ${service}.`,

    `Excellent experience from start to finish with ${businessName}.${helper ? `${helper} took great care of everything.` : ""} Highly recommended.`,
  ];
}