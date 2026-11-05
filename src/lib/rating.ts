/** Trustpilot's wording for a score band. Safe to use in client components. */
export function ratingLabel(rating: number): string {
  if (rating >= 4.3) return "Excellent";
  if (rating >= 3.8) return "Great";
  if (rating >= 2.8) return "Average";
  if (rating >= 1.8) return "Poor";
  return "Bad";
}
