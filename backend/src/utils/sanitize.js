export function sanitizeText(input) {
  if (typeof input !== "string") return input;
  return input.trim().replace(/[<>]/g, "");
}