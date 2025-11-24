export function getAutoTextColor(hex: string): string {
  if (!hex) return "#FFFFFF";
  const h = hex.replace("#", "");
  if (h.length === 3) {
    // expand shorthand
    hex = "#" + h.split("").map(c => c + c).join("");
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#000000" : "#FFFFFF";
}
