export const textToImage = async (text: string, signature?: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const width = 1080;
  const height = 1350;

  canvas.width = width;
  canvas.height = height;

  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "#111827");
  g.addColorStop(1, "#020617");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  const baseFont = 48;
  const maxWidth = width - 160;
  let fontSize = baseFont;

  const measureLines = (size: number) => {
    ctx.font = `700 ${size}px Inter, system-ui, Arial`;
    const words = text.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  let lines = measureLines(fontSize);
  while (lines.length * (fontSize * 1.25) > height * 0.6 && fontSize > 22) {
    fontSize -= 2;
    lines = measureLines(fontSize);
  }

  ctx.font = `700 ${fontSize}px Inter, system-ui, Arial`;
  const lineHeight = fontSize * 1.25;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  let y = startY;
  for (const line of lines) {
    ctx.fillText(line.trim(), width / 2, y);
    y += lineHeight;
  }

  if (signature) {
    ctx.shadowColor = "transparent";
    ctx.font = `500 20px Inter, system-ui, Arial`;
    ctx.fillStyle = "#d1d5db";
    ctx.fillText(`— ${signature}`, width / 2, height - 80);
  }

  return canvas.toDataURL("image/png");
};