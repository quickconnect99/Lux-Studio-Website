import type { InquiryServiceType, Service } from "@/lib/types";

export type InquiryServiceOption = {
  label: string;
  value: InquiryServiceType;
};

const serviceTypeByNumber: Record<string, InquiryServiceType> = {
  "01": "Commercial Shoot",
  "02": "Social Content",
  "03": "Event Coverage",
  "04": "Brand Campaign"
};

export function getInquiryServiceType(service: Service): InquiryServiceType {
  return serviceTypeByNumber[service.number] ?? "Other";
}

export function buildInquiryServiceOptions(
  services: Service[]
): InquiryServiceOption[] {
  const options = new Map<InquiryServiceType, InquiryServiceOption>();

  services.forEach((service) => {
    const value = getInquiryServiceType(service);
    if (!options.has(value)) {
      options.set(value, { label: service.title, value });
    }
  });

  if (!options.has("Other")) {
    options.set("Other", { label: "Other", value: "Other" });
  }

  return Array.from(options.values());
}
