import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export async function GET() {
  try {
    const products = await sql`
      SELECT
        products.id,
        products.name,
        products.price_lbp,
        products.image_url,
        products.category_id,
        categories.name AS category_name
      FROM products
      LEFT JOIN categories ON categories.id = products.category_id
      ORDER BY products.id DESC
    `;

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const category_id = Number(body?.category_id);
    const name = body?.name?.trim();
    const price_lbp = Number(body?.price_lbp);
    const image_url = body?.image_url?.trim() || "";

    if (!category_id || !name || !price_lbp) {
      return NextResponse.json(
        { error: "category_id, name, and price_lbp are required" },
        { status: 400 }
      );
    }

    const inserted = await sql`
      INSERT INTO products (category_id, name, price_lbp, image_url)
      VALUES (${category_id}, ${name}, ${price_lbp}, ${image_url})
      RETURNING *
    `;

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}