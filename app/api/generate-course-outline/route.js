import { inngest } from "@/inngest/client";
import { courseOutline } from "@/configs/AiModel";
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

        // Insert a placeholder course record first
        const savedCourse = await db.insert(STUDY_MATERIAL_TABLE)
            .values({
                courseId,
                createdBy,
                courseType,
                topic,
                difficultyLevel,
                courseLayout: null, // Placeholder
                status: "Generating"
            })
            .returning();

        // Fire off AI generation asynchronously
        (async () => {
            try {
                const PROMPT = `Generate study material for ${topic} for ${courseType} 
                    with difficulty level ${difficultyLevel}. Include:
                    - Course summary
                    - List of chapters with summaries
                    - Emoji icon for each chapter
                    - Topic list for each chapter
                    - Study tips for each chapter
                    - Suggestions for further reading
                    - Sources you got it from
                    - Minimum of 6 chapters
                    - Last chapter is for review and practice questions and further tips
                    Format the response as valid JSON.`;

                const aiResponse = await courseOutline.sendMessage(PROMPT);
                const aiResult = JSON.parse(aiResponse.response.text());

                if (!aiResult.chapters || !Array.isArray(aiResult.chapters)) {
                    throw new Error("Invalid AI response structure");
                }

                // Update the database with generated content
                await db.update(STUDY_MATERIAL_TABLE)
                    .set({ courseLayout: aiResult, status: "Completed" })
                    .where({ courseId });

                // Fire async tasks for generating notes & study content
                await inngest.send({
                    name: "notes.generate",
                    data: { 
                        course: { 
                            courseId, 
                            courseLayout: aiResult,
                            chapters: aiResult.chapters 
                        }
                    }
                });

                // Batch insert study type content records
                const studyTypeRecords = await db.insert(STUDY_TYPE_CONTENT)
                    .values(["flashcards", "quiz"].map(type => ({
                        courseId,
                        type,
                        content: null,
                        status: "Pending"
                    })))
                    .returning();

                // Trigger background jobs for each study type
                await Promise.all(studyTypeRecords.map(record =>
                    inngest.send({
                        name: "studyTypeContent.generate",
                        data: {
                            studyType: record.type,
                            courseId,
                            recordId: record.id,
                            chapters: aiResult.chapters
                        }
                    })
                ));
            } catch (err) {
                console.error("Async Process Error:", err);
                await db.update(STUDY_MATERIAL_TABLE)
                    .set({ status: "Failed", errorMessage: err.message })
                    .where({ courseId });
            }
        })();

        return NextResponse.json({ success: true, result: savedCourse[0] });

    } catch (error) {
        console.error("Request Error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
