import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const items = body.items;

  for (let i = 0; i < items.length; i++) {
    await sql`
      UPDATE categories
      SET sort_order = ${i}
      WHERE id = ${items[i].id}
    `;
  }

  return NextResponse.json({ success: true });
}