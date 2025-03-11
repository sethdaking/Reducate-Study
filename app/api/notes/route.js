// app/api/notes/route.js
import { db } from "@/configs/db";
import { CHAPTER_NOTES_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId } = await req.json();

        if (!courseId) {
            return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        }

        const notes = await db
            .select()
            .from(CHAPTER_NOTES_TABLE)
            .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));

        return NextResponse.json({ notes });
    } catch (error) {
        console.error("Error fetching notes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}