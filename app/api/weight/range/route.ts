import { auth } from "@/auth";
import { getWeightsBetweenDates } from "@/db/queries/weights";
import { NextResponse } from "next/server";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end || !DATE_RE.test(start) || !DATE_RE.test(end))
    return NextResponse.json({ error: "Invalid start or end" }, { status: 400 });
  if (start > end)
    return NextResponse.json({ error: "start must be <= end" }, { status: 400 });

  const data = await getWeightsBetweenDates(session.user.id, start, end);
  return NextResponse.json(data);
}
