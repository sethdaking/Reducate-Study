import { db } from "@/configs/db";
import { STUDY_TYPE_CONTENT } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId } = await req.json();

        if (!courseId) {
            return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        }

        const flashcards = await db
            .select()
            .from(STUDY_TYPE_CONTENT)
            .where(eq(STUDY_TYPE_CONTENT.courseId, courseId))
            .where(eq(STUDY_TYPE_CONTENT.type, 'flashcards'));

        if (!flashcards.length) {
            return NextResponse.json({ flashcards: [] });
        }

        const parsedContent = JSON.parse(flashcards[0].content);
        return NextResponse.json({ flashcards: parsedContent.flashcards || [] });
    } catch (error) {
        console.error("Error fetching flashcards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}