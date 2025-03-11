// app/api/courses/route.js
import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { createdBy } = await req.json();

        if (!createdBy) {
            return NextResponse.json({ error: "createdBy is required" }, { status: 400 });
        }

        const result = await db.select()
            .from(STUDY_MATERIAL_TABLE)
            .where(eq(STUDY_MATERIAL_TABLE.createdBy, createdBy))
            .orderBy(desc(STUDY_MATERIAL_TABLE.id));
                
        return NextResponse.json({ result });
    } catch (error) {
        console.error("Error in POST /api/courses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const reqUrl = req.url;
        const { searchParams } = new URL(reqUrl);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        }

        const course = await db.select()
            .from(STUDY_MATERIAL_TABLE)
            .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId));

        if (!course || course.length === 0) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json({ result: course[0] });
    } catch (error) {
        console.error("Error in GET /api/courses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}