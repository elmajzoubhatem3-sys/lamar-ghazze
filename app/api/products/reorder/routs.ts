import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];

    for (let i = 0; i < items.length; i++) {
      await sql`
        UPDATE products
        SET sort_order = ${i}
        WHERE id = ${Number(items[i].id)}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reorder products" },
      { status: 500 }
    );
  }
}