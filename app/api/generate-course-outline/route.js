import { inngest } from "@/inngest/client"
import { db } from "@/configs/db"
import { STUDY_MATERIAL_TABLE, STUDY_TYPE_CONTENT } from "@/configs/schema"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const { courseId, topic, courseType, difficultyLevel, createdBy } = await req.json();

        if (!courseId || !topic || !courseType || !difficultyLevel || !createdBy) {
            return NextResponse.json({ 
                error: "Missing required fields",
                received: { courseId, topic, courseType, difficultyLevel, createdBy }
            }, { status: 400 });
        }

        // Save a placeholder in the DB (AI will fill this later)
        const savedCourse = await db.insert(STUDY_MATERIAL_TABLE).values({
            courseId,
            createdBy,
            courseType,
            topic,
            difficultyLevel,
            courseLayout: null,  // AI will generate this
            status: 'Generating'
        }).returning();

        // Trigger Inngest to generate AI content asynchronously
        await inngest.send({
            name: 'course.generate',
            data: { 
                courseId,
                topic,
                courseType,
                difficultyLevel,
                createdBy
            }
        });

        return NextResponse.json({ 
            success: true,
            message: "Course generation started",
            result: savedCourse[0]
        });
    } catch (error) {
        console.error("Request Error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
