import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export async function GET() {
  try {
    const categories = await sql`
      SELECT * FROM categories
      ORDER BY sort_order ASC, id DESC
    `;
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();
    const sort_order = Number(body?.sort_order ?? 0);

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const inserted = await sql`
      INSERT INTO categories (name, sort_order)
      VALUES (${name}, ${sort_order})
      RETURNING *
    `;

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      {
        error: "Failed to create category",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}