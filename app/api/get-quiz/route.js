// pages/api/quizResults.js

import { db } from '@/configs/db'; // Assuming you have db setup using drizzle-orm
import { QUIZ_RESULTS_TABLE } from '@/configs/schema';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'GET') {
        const { courseId, startDate, endDate } = req.query;

        // Build the query based on provided filters
        const query = db.select()
            .from(QUIZ_RESULTS_TABLE)
            .where(
                courseId ? QUIZ_RESULTS_TABLE.courseId.eq(courseId) : true,
                startDate ? QUIZ_RESULTS_TABLE.timeCompleted.gte(new Date(startDate)) : true,
                endDate ? QUIZ_RESULTS_TABLE.timeCompleted.lte(new Date(endDate)) : true
            );

        try {
            const results = await query.all();
            res.status(200).json({ results });
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            res.status(500).json({ message: 'Failed to fetch quiz results' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
