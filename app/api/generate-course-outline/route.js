import { inngest } from "@/inngest/client"
import { courseOutline } from "@/configs/AiModel"
import { db } from "@/configs/db"
import { STUDY_MATERIAL_TABLE, STUDY_TYPE_CONTENT } from "@/configs/schema"
import { NextResponse } from "next/server"

export const maxDuration = 30; // 300 seconds (5 minutes)


export async function POST(req) {
    try {
        const { courseId, topic, courseType, difficultyLevel, createdBy } = await req.json();

        if (!courseId || !topic || !courseType || !difficultyLevel || !createdBy) {
            return NextResponse.json({ 
                error: "Missing required fields",
                received: { courseId, topic, courseType, difficultyLevel, createdBy }
            }, { status: 400 });
        }

        // Create the prompt
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

        try {
            // Generate Course Layout Using AI
            const aiResponse = await courseOutline.sendMessage(PROMPT);
            const aiResult = JSON.parse(aiResponse.response.text());

            // Validate AI response structure
            if (!aiResult.chapters || !Array.isArray(aiResult.chapters)) {
                throw new Error('Invalid AI response structure');
            }

            // Save Course Layout to Database
            const savedCourse = await db.insert(STUDY_MATERIAL_TABLE).values({
                courseId,
                createdBy,
                courseType,
                topic,
                difficultyLevel,
                courseLayout: aiResult,
                status: 'Generating'
            }).returning();

            // Trigger notes generation
            await inngest.send({
                name: 'notes.generate',
                data: { 
                    course: { 
                        courseId, 
                        courseLayout: aiResult,
                        chapters: aiResult.chapters 
                    }
                }
            });

            // Create study type content records and trigger generation
            await Promise.all(['flashcards', 'quiz'].map(async (type) => {
                const record = await db.insert(STUDY_TYPE_CONTENT)
                    .values({
                        courseId,
                        type,
                        content: null,
                        status: 'Pending'
                    })
                    .returning();

                await inngest.send({
                    name: "studyTypeContent.generate",
                    data: {
                        studyType: type,
                        courseId,
                        recordId: record[0].id,
                        chapters: aiResult.chapters
                    }
                });
            }));

            return NextResponse.json({ 
                success: true,
                result: savedCourse[0]
            });
        } catch (aiError) {
            console.error("AI or Database Error:", aiError);
            return NextResponse.json({ 
                error: "Failed to generate or save course content",
                details: aiError.message
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Request Error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}