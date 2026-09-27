import { siteConfig } from "@/config/site";
import type { Course } from "@/types/course";

export interface CoursePricing {
  /** The price the learner pays. */
  current: number;
  /** Set only when a genuine discount applies. */
  original: number | null;
  savings: number | null;
  savingsPercent: number | null;
}

const numberFormat = new Intl.NumberFormat(siteConfig.currency.locale, {
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return `${siteConfig.currency.symbol} ${numberFormat.format(amount)}`;
}

/**
 * The single place discount rules live. A discount counts only when it is
 * positive and strictly below the actual price, so the same price is never
 * shown twice and no fake savings appear.
 */
export function getCoursePricing(
  course: Pick<Course, "actual_price" | "discount_price">,
): CoursePricing {
  const { actual_price, discount_price } = course;

  if (discount_price != null && discount_price > 0 && discount_price < actual_price) {
    const savings = actual_price - discount_price;
    return {
      current: discount_price,
      original: actual_price,
      savings,
      savingsPercent: Math.round((savings / actual_price) * 100),
    };
  }

  return { current: actual_price, original: null, savings: null, savingsPercent: null };
}
