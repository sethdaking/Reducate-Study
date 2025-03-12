import { inngest } from "@/inngest/client"
import { courseOutline } from "@/configs/AiModel"
import { db } from "@/configs/db"
import { STUDY_MATERIAL_TABLE, STUDY_TYPE_CONTENT } from "@/configs/schema"

export const generateCourse = inngest.createFunction(
    { name: "course.generate" },
    async ({ event }) => {
        const { courseId, topic, courseType, difficultyLevel, createdBy } = event.data;

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
            // Generate AI content
            const aiResponse = await courseOutline.sendMessage(PROMPT);
            const aiResult = JSON.parse(aiResponse.response.text());

            // Validate AI response structure
            if (!aiResult.chapters || !Array.isArray(aiResult.chapters)) {
                throw new Error('Invalid AI response structure');
            }

            // Update the database with the AI-generated content
            await db.update(STUDY_MATERIAL_TABLE)
                .set({ courseLayout: aiResult, status: "Completed" })
                .where({ courseId });

            // Trigger notes & study materials generation
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

            // Create study type content records
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

        } catch (error) {
            console.error("AI Processing Error:", error);
            await db.update(STUDY_MATERIAL_TABLE)
                .set({ status: "Failed", error: error.message })
                .where({ courseId });
        }
    }
);
