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