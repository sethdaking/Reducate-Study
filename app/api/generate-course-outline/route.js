// api/generate-course-outline/route.js
import { inngest } from "@/inngest/client";
import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE, STUDY_TYPE_CONTENT } from "@/configs/schema";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { courseId, topic, courseType, difficultyLevel, createdBy } = await req.json();

    if (!courseId || !topic || !courseType || !difficultyLevel || !createdBy) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          received: { courseId, topic, courseType, difficultyLevel, createdBy }
        },
        { status: 400 }
      );
    }

    // Insert the initial record with a status indicating processing.
    const savedCourse = await db.insert(STUDY_MATERIAL_TABLE)
      .values({
        courseId,
        createdBy,
        courseType,
        topic,
        difficultyLevel,
        courseLayout: null, // Not generated yet
        status: "Processing"
      })
      .returning();

    // Trigger the Inngest background event for heavy processing
    await inngest.send({
      name: "generate.courseOutline", // This event name should match your Inngest background function
      data: { 
        courseId,
        topic,
        courseType,
        difficultyLevel,
        createdBy,
        recordId: savedCourse[0].id
      }
    });

    // Return immediately so the API responds in under 10 seconds
    return NextResponse.json({
      success: true,
      message: "Course outline generation started",
      record: savedCourse[0]
    });
  } catch (error) {
    console.error("Request Error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: error.message
      },
      { status: 500 }
    );
  }
}
