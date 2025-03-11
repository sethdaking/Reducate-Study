import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId } = await req.json();
        
        const result = await db
            .select()
            .from(STUDY_MATERIAL_TABLE)
            .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId));

        return NextResponse.json({ result: result[0] });
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}