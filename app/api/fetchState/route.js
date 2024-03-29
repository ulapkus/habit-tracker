import Connect from "../../../utils/db";
import Users from "../../../models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
    await Connect();
    const session = await getServerSession();
    const query = { email: session.user.email };
    const data = await Users.find(query, { _id: 0, days: 1, colors: 1, habits: 1 });
    return NextResponse.json({ data }, { status: 200 });
  }
  