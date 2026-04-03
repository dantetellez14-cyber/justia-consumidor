import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

// POST: Submit feedback
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const body = await request.json();

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      case_id: body.case_id || null,
      rating: body.rating,
      comment: body.comment || null,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
