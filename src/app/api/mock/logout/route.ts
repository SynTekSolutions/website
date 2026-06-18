import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const isMockEnabled =
    process.env.E2E_MOCK_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");

  if (!isMockEnabled) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.delete("x-mock-user-id");
  cookieStore.delete("x-mock-session-id");

  return NextResponse.redirect(
    new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
}
