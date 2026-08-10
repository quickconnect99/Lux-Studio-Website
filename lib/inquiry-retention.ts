export const DEFAULT_INQUIRY_RETENTION_DAYS = 365;
export const MINIMUM_INQUIRY_RETENTION_DAYS = 30;
export const MAXIMUM_INQUIRY_RETENTION_DAYS = 3650;

export function getInquiryRetentionDays(
  value = process.env.INQUIRY_RETENTION_DAYS
) {
  const parsed = Number(value ?? DEFAULT_INQUIRY_RETENTION_DAYS);

  return Number.isInteger(parsed) &&
    parsed >= MINIMUM_INQUIRY_RETENTION_DAYS &&
    parsed <= MAXIMUM_INQUIRY_RETENTION_DAYS
    ? parsed
    : DEFAULT_INQUIRY_RETENTION_DAYS;
}
