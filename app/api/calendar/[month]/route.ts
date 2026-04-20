import { auth } from "@/auth";
import { getMonthSummary } from "@/db/queries/entries";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ month: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month))
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });

  const summary = await getMonthSummary(session.user.id, month);
  return NextResponse.json(summary);
}
