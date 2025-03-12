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
    // Get Event Data
    const result = await step.run(
      "Check User and create new if not in DB", async () => {
        // Check if User already exists
        const result = await db
          .select()
          .from(USER_TABLE)
          .where(eq(USER_TABLE.email, user?.primaryEmailAddress?.emailAddress));

        console.log(result);

        if (result?.length === 0) {
          // If Not add to Database
          const userResponse = await db
            .insert(USER_TABLE)
            .values({
              name: user?.fullName,
              email: user?.primaryEmailAddress?.emailAddress,
            })
            .returning({ id: USER_TABLE?.id });
          return userResponse;
        }
        return result;
      });

    return "Success";
  }

);

export const GenerateNotes = inngest.createFunction(
  { id: "generate-course" },
  { event: 'notes.generate' },
  async ({ event, step }) => {
    console.log("GenerateNotes function invoked with event:", event);
    const { course } = event.data;

    const notesResult = await step.run('Generate Chapter Notes', async () => {
      const Chapters = course?.courseLayout?.chapters;
      if (!Chapters || Chapters.length === 0) {
        throw new Error("No chapters found in course layout");
      }

      for (const [index, chapter] of Chapters.entries()) {
        console.log(`Generating notes for chapter ${index + 1}:`, chapter);
        
        try {
          // Create a more structured prompt
          const PROMPT = `Generate detailed exam notes for the following chapter:
            Title: ${chapter.chapter_title}
            Summary: ${chapter.summary}
            Topics: ${chapter.topics?.join(', ')}
            
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

          // Generate AI response
          const aiResponse = await generateNotes.sendMessage(PROMPT);
          let aiContent = aiResponse.response.text();

          // Format content to replace any remaining \n with <br>
          aiContent = aiContent
            .replace(/\\n/g, '<br>')
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '')
            .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br>'); // Remove double line breaks

          if (!aiContent) {
            throw new Error(`No content generated for chapter ${index + 1}`);
          }

          // Store in database with error handling
          await db.insert(CHAPTER_NOTES_TABLE).values({
            courseId: course.courseId,
            chapterId: index,
            chapterTitle: chapter.chapter_title,
            notes: aiContent,
            emoji: chapter.emoji || '📚',
            status: 'completed'
          });

          console.log(`Successfully generated notes for chapter ${index + 1}`);
        } catch (error) {
          console.error(`Error generating notes for chapter ${index + 1}:`, error);
          throw error;
        }
      }
      return 'Notes generation completed successfully';
    });

    // Update course status to Ready
    await step.run('Update Course Status', async () => {
      await db.update(STUDY_MATERIAL_TABLE)
        .set({ status: 'Ready' })
        .where(eq(STUDY_MATERIAL_TABLE.courseId, course.courseId));
    });

    return { status: 'success', message: notesResult };
  }
);

// inngest/functions.js - Update the GenerateStudyTypeContent function

// inngest/functions.js - Update the GenerateStudyTypeContent function

export const GenerateStudyTypeContent = inngest.createFunction(
  { id: "generate-study-type-content" },
  { event: "studyTypeContent.generate" },
  async ({ event, step }) => {
    const { studyType, courseId, recordId, chapters } = event.data;

    if (!chapters || !Array.isArray(chapters)) {
      throw new Error("Invalid chapters data");
    }

    try {
      const aiResponse = await step.run("Generate Content", async () => {
        let prompt;
        let response;
        
        if (studyType === "flashcards") {
          prompt = `
            Generate comprehensive flashcards for these chapters:
            ${JSON.stringify(chapters)}

            Return a JSON object with this exact structure:
            {
              "flashcards": [
                {
                  "front": "What is the concept being asked?",
                  "back": "Detailed explanation of the concept"
                }
              ]
            }

            Make sure each flashcard:
            1. Uses proper markup (<strong> for emphasis)
            2. Covers key concepts and terminology
            3. Has clear, specific questions
            4. Provides comprehensive but concise answers
            5. Includes examples where appropriate
            6. Is properly formatted as JSON
            7. Does not Use "Question:" and "Answer:" prefixes with emphasis
          `;
          response = await generateStudyType.sendMessage(prompt);
        } else if (studyType === "quiz") {
          prompt = `
            Generate a comprehensive quiz for these chapters:
            ${JSON.stringify(chapters)}

            Return a JSON object with this exact structure:
            {
              "quiz": [
                {
                  "question": "What is being asked?",
                  "options": [
                    "First option",
                    "Second option",
                    "Third option",
                    "Fourth option"
                  ],
                  "correctAnswer": "A",
                  "explanation": "* Explanation: * Why this is the correct answer"
                }
              ]
            }

            Make sure each quiz question:
            1. Uses proper markup (<strong> for emphasis)
            2. Tests understanding of key concepts
            3. Has clear, unambiguous questions
            4. Provides plausible but distinct options
            5. Includes detailed explanations
            6. Is properly formatted as JSON
            7. Does not use "Question:" and "Explanation:" prefixes with emphasis
            8. Minimum of 25 Questions
            9. Does not include the letters in the text
          `;
          response = await GenerateQuiz.sendMessage(prompt);
        } else if (studyType === "qna") {
          prompt = `
            Generate comprehensive question and answer pairs for these chapters:
            ${JSON.stringify(chapters)}

            Return a JSON object with this exact structure:
            {
              "qna": [
                {
                  "question": "Detailed question that tests deep understanding?",
                  "answer": "Comprehensive answer with detailed explanation and examples where appropriate"
                }
              ]
            }

            Make sure each QNA pair:
            1. Tests deep conceptual understanding
            2. Covers important topics from the chapters
            3. Has clear, specific questions that require detailed answers
            4. Provides comprehensive explanations in the answers
            5. Includes examples, applications, or comparisons where appropriate
            6. Is properly formatted as JSON
          `;
          response = await generateQNA.sendMessage(prompt);
        } else {
          throw new Error(`Unsupported study type: ${studyType}`);
        }

        let content = response.response.text();

        // Clean response
        content = content
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/\r?\n|\r/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Extract and validate JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in response");
        }

        const parsedContent = JSON.parse(jsonMatch[0]);
        if (
          (studyType === "flashcards" && (!parsedContent.flashcards || !Array.isArray(parsedContent.flashcards))) ||
          (studyType === "quiz" && (!parsedContent.quiz || !Array.isArray(parsedContent.quiz))) ||
          (studyType === "qna" && (!parsedContent.qna || !Array.isArray(parsedContent.qna)))
        ) {
          throw new Error(`Invalid ${studyType} structure`);
        }

        console.log(`Successfully generated ${studyType} content with ${
          studyType === "flashcards" ? parsedContent.flashcards.length :
          studyType === "quiz" ? parsedContent.quiz.length :
          parsedContent.qna.length
        } items`);

        return parsedContent;
      });

      // Save to database using STUDY_TYPE_CONTENT schema
      await step.run("Save Content", async () => {
        await db
          .update(STUDY_TYPE_CONTENT)
          .set({
            content: aiResponse,
            type: studyType,
            status: "Ready"
          })
          .where(eq(STUDY_TYPE_CONTENT.id, recordId));
        
        console.log(`Saved ${studyType} content to database with record ID: ${recordId}`);
      });

      return {
        status: "success",
        message: `Generated ${studyType} for course ${courseId}`,
        contentId: recordId
      };

    } catch (error) {
      console.error(`Error generating ${studyType}:`, error);
      
      await step.run("Update Failed Status", async () => {
        await db
          .update(STUDY_TYPE_CONTENT)
          .set({ status: "Failed" })
          .where(eq(STUDY_TYPE_CONTENT.id, recordId));
      });

      throw error;
    }
  }
);

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
