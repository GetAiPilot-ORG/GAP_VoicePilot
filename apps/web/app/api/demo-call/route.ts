import { NextResponse } from "next/server";
import { checkDemoEligibilityAction, triggerOneTimeDemoCallAction } from "@/app/actions/demoCall";

export async function GET() {
  try {
    const res = await checkDemoEligibilityAction();
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to check eligibility" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone_number = body.phone_number || body.phone || body.customerNumber;

    if (!phone_number) {
      return NextResponse.json({ error: "Missing required field: phone_number" }, { status: 400 });
    }

    const res = await triggerOneTimeDemoCallAction({ phone_number });
    if (!res.success) {
      return NextResponse.json(res, { status: res.needAuth ? 401 : 400 });
    }

    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to trigger demo call" }, { status: 500 });
  }
}
