import { NextResponse } from "next/server";
interface Params {
  params: { momentId: string };
}

export async function GET(_req: Request, { params }: Params) {
  // TODO: Fetch a single moment
  return NextResponse.json({ momentId: params.momentId, moment: null });
}

export async function PATCH(_req: Request, { params }: Params) {
  // TODO: Update moment (e.g. autosave, mark sent, etc.)
  return NextResponse.json({
    momentId: params.momentId,
    message: "Moment updated (stub)",
  });
}