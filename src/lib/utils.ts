export { cn } from "cn"

/** tel: link for a display number such as "+977-9766715768". */
export function buildTelUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`
}
