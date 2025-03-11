import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { QUIZ_RESULTS_TABLE } from "@/configs/schema";

export async function POST(req) {
  try {
    // Get the current user using Clerk's currentUser helper
    const user = await currentUser();
    console.log("Current user:", user);

    // Ensure a user is logged in and has at least one email address
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the first email address as createdBy
    const createdBy = user.emailAddresses[0].emailAddress;

    // Parse the request body for courseId and results
    const { courseId, results } = await req.json();
    if (!courseId || !results) {
      return NextResponse.json(
        { error: "Missing required fields: courseId or results" },
        { status: 400 }
      );
    }

    // Insert the quiz result record into the database
    const inserted = await db
      .insert(QUIZ_RESULTS_TABLE)
      .values({
        courseId,
        score: results.score,
        correctAnswers: results.correct,
        incorrectAnswers: results.incorrect,
        totalQuestions: results.totalQuestions,
        timeStarted: new Date(results.timeStarted),
        timeCompleted: new Date(results.timeCompleted),
        answers: results.answers,
        createdBy,
      })
      .returning();

    return NextResponse.json({ success: true, result: inserted[0] });
  } catch (error) {
    console.error("Error in POST /api/quiz-results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
