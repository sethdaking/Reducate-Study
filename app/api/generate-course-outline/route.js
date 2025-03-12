import { inngest } from "@/inngest/client";
import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE, STUDY_TYPE_CONTENT } from "@/configs/schema";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId, topic, courseType, difficultyLevel, createdBy } = await req.json();

        if (!courseId || !topic || !courseType || !difficultyLevel || !createdBy) {
            return NextResponse.json({ 
                error: "Missing required fields",
                received: { courseId, topic, courseType, difficultyLevel, createdBy }
            }, { status: 400 });
        }

        // Save initial course entry with 'Generating' status
        const savedCourse = await db.insert(STUDY_MATERIAL_TABLE).values({
            courseId,
            createdBy,
            courseType,
            topic,
            difficultyLevel,
            status: "Generating"
        }).returning();

        // Trigger course outline generation
        await inngest.send({
            name: "outline.generate",
            data: { courseId }
        });

        // Create study type content records and trigger generation
        await Promise.all(["flashcards", "quiz"].map(async (type) => {
            const record = await db.insert(STUDY_TYPE_CONTENT)
                .values({
                    courseId,
                    type,
                    content: null,
                    status: "Pending"
                })
                .returning();

            await inngest.send({
                name: "studyTypeContent.generate",
                data: {
                    studyType: type,
                    courseId,
                    recordId: record[0].id
                }
            });
        }));

        return NextResponse.json({ 
            success: true,
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
