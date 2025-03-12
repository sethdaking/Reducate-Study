import { inngest } from "./client";
import { USER_TABLE, STUDY_MATERIAL_TABLE, CHAPTER_NOTES_TABLE, STUDY_TYPE_CONTENT } from "@/configs/schema";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";
import { generateNotes, generateStudyType, GenerateQuiz, generateQNA } from "@/configs/AiModel";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const CreateNewUser = inngest.createFunction(
  { id: "create-user" },
  { event: "user.create" },
  async ({ event, step }) => {
    const { user } = event.data;

    const result = await step.run("Check User and create new if not in DB", async () => {
      const existingUser = await db
        .select()
        .from(USER_TABLE)
        .where(eq(USER_TABLE.email, user?.primaryEmailAddress?.emailAddress));

      if (existingUser.length === 0) {
        const userResponse = await db
          .insert(USER_TABLE)
          .values({
            name: user?.fullName,
            email: user?.primaryEmailAddress?.emailAddress,
          })
          .returning({ id: USER_TABLE?.id });

        return userResponse;
      }
      return existingUser;
    });

    return "Success";
  }
);

export const GenerateNotes = inngest.createFunction(
  { id: "generate-course" },
  { event: "notes.generate" },
  async ({ event, step }) => {
    console.log("GenerateNotes function invoked with event:", event);
    const { course } = event.data;

    const notesResult = await step.run("Generate Chapter Notes", async () => {
      const Chapters = course?.courseLayout?.chapters;
      if (!Chapters || Chapters.length === 0) {
        throw new Error("No chapters found in course layout");
      }

      for (const [index, chapter] of Chapters.entries()) {
        console.log(`Generating notes for chapter ${index + 1}:`, chapter);

        try {
          const PROMPT = `Generate detailed exam notes for the following chapter:
            Title: ${chapter.chapter_title}
            Summary: ${chapter.summary}
            Topics: ${chapter.topics?.join(", ")}
            
            Please provide comprehensive notes in HTML format following these rules:
            1. Use <h1>, <h2>, <h3> for headings
            2. Use <p> for paragraphs
            3. Use <br> for line breaks
            4. Use <ul> and <li> for lists
            5. Exclude html, head, body, title tags
            6. Never use \\n - always use <br> for line breaks
            7. Format content with proper HTML spacing
            8. Break down all concepts to the simplest form.

            Include all topics and maintain academic rigor.`;

          const aiResponse = await generateNotes.sendMessage(PROMPT);
          let aiContent = await aiResponse.response.text();

          aiContent = aiContent
            .replace(/\\n/g, "<br>")
            .replace(/\n/g, "<br>")
            .replace(/\r/g, "")
            .replace(/<br\s*\/?>\s*<br\s*\/?>/g, "<br>");

          if (!aiContent) {
            throw new Error(`No content generated for chapter ${index + 1}`);
          }

          await db.insert(CHAPTER_NOTES_TABLE).values({
            courseId: course.courseId,
            chapterId: index,
            chapterTitle: chapter.chapter_title,
            notes: aiContent,
            emoji: chapter.emoji || "📚",
            status: "completed",
          });

          console.log(`Successfully generated notes for chapter ${index + 1}`);
        } catch (error) {
          console.error(`Error generating notes for chapter ${index + 1}:`, error);
          throw error;
        }
      }
      return "Notes generation completed successfully";
    });

    await step.run("Update Course Status", async () => {
      await db
        .update(STUDY_MATERIAL_TABLE)
        .set({ status: "Ready" })
        .where(eq(STUDY_MATERIAL_TABLE.courseId, course.courseId));
    });

    return { status: "success", message: notesResult };
  }
);

export const studyMaterialCreate = inngest.createFunction(
  { id: "study-material-create" },
  { event: "study.material.create" },
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
      const aiResponse = await courseOutline.sendMessage(PROMPT);
      const aiResult = JSON.parse(await aiResponse.response.text());

      if (!aiResult.chapters || !Array.isArray(aiResult.chapters)) {
        throw new Error("Invalid AI response structure");
      }

      const savedCourse = await db.insert(STUDY_MATERIAL_TABLE).values({
        courseId,
        createdBy,
        courseType,
        topic,
        difficultyLevel,
        courseLayout: aiResult,
        status: "Generating",
      }).returning();

      await inngest.send({
        name: "notes.generate",
        data: {
          course: {
            courseId,
            courseLayout: aiResult,
            chapters: aiResult.chapters,
          },
        },
      });

      await Promise.all(["flashcards", "quiz"].map(async (type) => {
        const record = await db.insert(STUDY_TYPE_CONTENT).values({
          courseId,
          type,
          content: null,
          status: "Pending",
        }).returning();

        await inngest.send({
          name: "studyTypeContent.generate",
          data: {
            studyType: type,
            courseId,
            recordId: record[0].id,
            chapters: aiResult.chapters,
          },
        });
      }));

      return { success: true, result: savedCourse[0] };
    } catch (error) {
      console.error("Inngest Processing Error:", error);
      throw new Error(`Failed to generate or save course content: ${error.message}`);
    }
  }
);
