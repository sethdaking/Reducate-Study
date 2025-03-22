// app/api/study-type/route.js

import { db } from "@/configs/db";
import { STUDY_TYPE_CONTENT, CHAPTER_NOTES_TABLE } from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId } = await req.json();

        if (!courseId) {
            return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        }

        // Initialize response
        const response = {
            notes: [],
            flashcards: [],
            quiz: [],
            qna: []
        };

        // Fetch all study content
        const studyContent = await db
            .select()
            .from(STUDY_TYPE_CONTENT)
            .where(eq(STUDY_TYPE_CONTENT.courseId, courseId));

        // Process content by type
        studyContent.forEach(item => {
            if (item.content) {
                try {
                    const content = item.content;
                    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

                    if (item.type === 'quiz' && parsed.quiz) {
                        response.quiz = parsed.quiz;
                        console.log('Quiz content loaded:', response.quiz.length, 'questions');
                    } else if (item.type === 'flashcards' && parsed.flashcards) {
                        response.flashcards = parsed.flashcards.map(card => ({
                            front: formatText(card.front),
                            back: formatText(card.back)
                        }));
                        console.log('Flashcards content loaded:', response.flashcards.length, 'cards');
                    } else if (item.type === 'qna' && parsed.qna) {
                        response.qna = parsed.qna;
                        console.log('QNA content loaded:', response.qna.length, 'questions');
                    }
                } catch (e) {
                    console.error(`Error processing ${item.type}:`, e);
                }
            }
        });

        // Fetch notes
        const notes = await db
            .select()
            .from(CHAPTER_NOTES_TABLE)
            .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));

        response.notes = notes || [];

        return NextResponse.json(response);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function formatText(text) {
    if (!text) return '';
    
    return text
        // Format question/answer patterns
        .replace(/\*\s*Question:\s*\*/g, '<strong>Question:</strong>')
        .replace(/\*\s*Answer:\s*\*/g, '<strong>Answer:</strong>')
        .replace(/\*\s*Explanation:\s*\*/g, '<strong>Explanation:</strong>')
        // Replace markdown-style bold with HTML strong tags
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convert bullet points to more compact HTML
        .replace(/^\s*[-*+]\s+(.+)$/gm, '<span class="block text-sm mb-1">• $1</span>')
        // Handle paragraphs with proper spacing
        .replace(/\n\n/g, '<br/>')
        // Remove excessive whitespace while preserving necessary spaces

}

