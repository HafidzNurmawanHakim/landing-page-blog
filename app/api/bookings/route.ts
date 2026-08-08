import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/app/actions/booking";
import type { BookingInput } from "@/lib/validations/booking";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings
 *
 * Fallback endpoint without JavaScript (docs/05-api-server-actions.md).
 * Server Actions remain the primary booking path; this route mirrors the same
 * validation + persistence pipeline for non-JS clients.
 *
 * Response contract:
 *   Success: { data: { bookingCode: string } } with 201
 *   Error:   { error: string } or { errors: [{ field, message }] } with 4xx
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const result = await createBooking(body as BookingInput);

  if (!result.success) {
    return NextResponse.json(
      "errors" in result ? { errors: result.errors } : { error: result.message },
      { status: result.status }
    );
  }

  return NextResponse.json(
    { data: { bookingCode: result.bookingCode } },
    { status: 201 }
  );
}
