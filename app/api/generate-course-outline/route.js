import { inngest } from "@/inngest/client";
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

        // Trigger the Inngest function asynchronously
        await inngest.send({
            name: "study.material.create",
            data: { courseId, topic, courseType, difficultyLevel, createdBy }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Study material generation triggered successfully." 
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ 
            error: "Failed to trigger study material generation",
            details: error.message 
        }, { status: 500 });
    }
}
