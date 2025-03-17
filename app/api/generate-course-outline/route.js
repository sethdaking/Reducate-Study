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
            - JSON CONTENT MUST ALWAYS BE IN THIS FORMAT:{
  "course_name": "Push-Up Power: A Beginner's Guide to Perfecting Your Push-Up",
  "course_summary": "This course is designed for absolute beginners who want to learn how to perform a proper push-up. We'll break down the movement into manageable steps, focusing on form, strength building, and progression. By the end of this course, you'll have the knowledge and strength to confidently perform push-ups.",
  "chapters": [
    {
      "chapter_number": 1,
      "chapter_title": "Understanding the Push-Up",
      "emoji": "🤔",
      "chapter_summary": "This chapter introduces the push-up exercise, its benefits, and the muscles involved. We'll discuss common misconceptions and the importance of proper form to prevent injuries.",
      "topics": [
        "What is a Push-Up?",
        "Benefits of Push-Ups (Strength, Endurance, Core Stability)",
        "Muscles Worked (Pectorals, Triceps, Shoulders, Core)",
        "Common Mistakes to Avoid",
        "Importance of Proper Form"
      ],
      "study_tips": [
        "Visualize the movement before attempting it.",
        "Focus on engaging your core throughout the exercise."
      ],
      "further_reading": [
        "Search online for anatomical diagrams of the muscles involved in push-ups."
      ]
    },
    {
      "chapter_number": 2,
      "chapter_title": "Building a Solid Foundation: The Plank",
      "emoji": "🧱",
      "chapter_summary": "This chapter focuses on mastering the plank, which is essential for developing the core strength needed for push-ups. We'll cover proper plank form and variations to build endurance.",
      "topics": [
        "What is a Plank?",
        "Proper Plank Form (Alignment, Core Engagement)",
        "Plank Variations (Forearm Plank, High Plank)",
        "Plank Progressions (Increasing Hold Time)",
        "Common Plank Mistakes and Corrections"
      ],
      "study_tips": [
        "Record yourself doing a plank to check your form.",
        "Focus on maintaining a straight line from head to heels."
      ],
      "further_reading": [
        "Explore different plank variations for a greater challenge."
      ]
    },
    {
      "chapter_number": 3,
      "chapter_title": "Wall Push-Ups: The First Step",
      "emoji": "🧱",
      "chapter_summary": "Wall push-ups are a great way to build strength and get used to the movement pattern without the full weight of your body. We'll discuss proper form and variations.",
      "topics": [
        "What are Wall Push-Ups?",
        "Proper Form (Hand Placement, Body Angle)",
        "Variations (Different Hand Widths)",
        "Progressing to further steps"
      ],
      "study_tips": [
        "Make sure to keep your core engaged",
        "Make sure that your body is aligned properly"
      ],
      "further_reading": [
        "Read articles from fitness magazines or health websites."
      ]
    },
    {
      "chapter_number": 4,
      "chapter_title": "Incline Push-Ups: Decreasing the Load",
      "emoji": "⛰️",
      "chapter_summary": "Incline push-ups allow you to gradually increase the difficulty by using an elevated surface (e.g., a bench or chair). We'll focus on finding the right incline and maintaining proper form.",
      "topics": [
        "What are Incline Push-Ups?",
        "Choosing the Right Incline (Bench, Chair, etc.)",
        "Proper Form (Similar to Wall Push-Ups)",
        "Progressing to a lower inclination"
      ],
      "study_tips": [
        "Start with a higher incline and gradually lower it as you get stronger.",
        "Focus on controlled movements."
      ],
      "further_reading": [
        "Search online for articles describing the correct inclination."
      ]
    },
    {
      "chapter_number": 5,
      "chapter_title": "Knee Push-Ups: Modifying the Challenge",
      "emoji": "🧎",
      "chapter_summary": "Knee push-ups are a modification that reduces the amount of weight you have to lift, making them a great stepping stone to full push-ups. We'll cover proper form and how to transition to full push-ups.",
      "topics": [
        "What are Knee Push-Ups?",
        "Proper Form (Maintaining a Straight Line from Knees to Head)",
        "Focus on the muscles involved",
        "Transitioning to Full Push-Ups (Gradually Decreasing Knee Support)"
      ],
      "study_tips": [
        "Focus on engaging your core to prevent your hips from sagging.",
        "Maintain a straight line from your knees to your head."
      ],
      "further_reading": [
        "Look for resources that compare knee push ups to full push ups."
      ]
    },
    {
      "chapter_number": 6,
      "chapter_title": "The Full Push-Up: Achieving Proper Form",
      "emoji": "💪",
      "chapter_summary": "This chapter focuses on performing a full push-up with proper form. We'll cover hand placement, body alignment, and breathing techniques to maximize your results and prevent injuries.",
      "topics": [
        "Proper Hand Placement (Shoulder-Width Apart, Slightly Wider)",
        "Body Alignment (Straight Line from Head to Heels)",
        "Breathing Technique (Inhale on the Way Down, Exhale on the Way Up)",
        "Range of Motion (Chest to the Floor)",
        "Common Mistakes and Corrections"
      ],
      "study_tips": [
        "Record yourself to check your form.",
        "Focus on controlled movements and core engagement."
      ],
      "further_reading": [
        "Watch videos of professional athletes demonstrating proper push-up form."
      ]
    },
    {
      "chapter_number": 7,
      "chapter_title": "Review, Practice, and Further Tips",
      "emoji": "🏋️‍♀️",
      "chapter_summary": "This chapter provides a review of the entire course, offering practice questions and further tips to help you improve your push-up technique and progress to more advanced variations. We'll also discuss setting goals and tracking your progress.",
      "topics": [
        "Review of Key Concepts (Plank, Wall Push-Ups, Incline Push-Ups, Knee Push-Ups, Full Push-Ups)",
        "Practice Questions (Form Check, Troubleshooting Common Issues)",
        "Further Tips (Varying Hand Placement, Tempo)",
        "Setting Goals (Number of Reps, Sets)",
        "Tracking Progress (Journaling, Apps)"
      ],
      "study_tips": [
        "Consistency is key. Aim to practice push-ups several times a week.",
        "Listen to your body and don't push yourself too hard, especially when starting out.",
        "Find a workout buddy for motivation and accountability."
      ],
      "further_reading": [
        "Explore advanced push-up variations (e.g., diamond push-ups, decline push-ups).",
        "Research different workout programs that incorporate push-ups."
      ]
    }
  ],
  "sources": [
    "National Strength and Conditioning Association (NSCA) guidelines",
    "American College of Sports Medicine (ACSM) resources",
    "Bodybuilding.com exercise guides",
    "Fitness Blender workout videos",
    "NHS.uk fitness advice"
  ]
}
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