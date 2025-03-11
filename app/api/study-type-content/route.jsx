import { db } from "@/configs/db";
import { STUDY_TYPE_CONTENT } from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId, type } = await req.json();

        if (!courseId || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if record exists first
        const existing = await db
            .select()
            .from(STUDY_TYPE_CONTENT)
            .where(
                and(
                    eq(STUDY_TYPE_CONTENT.courseId, courseId),
                    eq(STUDY_TYPE_CONTENT.type, type)
                )
            );

        let result;

        if (existing.length > 0) {
            // Update existing record
            result = await db
                .update(STUDY_TYPE_CONTENT)
                .set({
                    content: null, // Initially set to null
                    status: 'Pending',
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(STUDY_TYPE_CONTENT.courseId, courseId),
                        eq(STUDY_TYPE_CONTENT.type, type)
                    )
                )
                .returning();
        } else {
            // Insert new record
            result = await db
                .insert(STUDY_TYPE_CONTENT)
                .values({
                    courseId,
                    type,
                    content: null,
                    status: 'Pending'
                })
                .returning();
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to create study type content" },
            { status: 500 }
        );
    }
}