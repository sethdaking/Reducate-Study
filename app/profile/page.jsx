import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/configs/db"; // Import your Drizzle instance
import { QUIZ_RESULTS_TABLE } from "@/configs/schema"; // Import your table schema
import { format, formatDistance } from "date-fns";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { eq } from "drizzle-orm";

export default async function QuizResultsPage() {
  // Get the current user from Clerk
  const user = await currentUser();
  
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <p>No user is logged in.</p>
      </div>
    );
  }
  
  // Use the first email address as the identifier
  const userEmail = user.emailAddresses[0].emailAddress;
  
  // Fetch quiz results from the database filtered by the current user's email in the createdBy column
  const results = await db
    .select()
    .from(QUIZ_RESULTS_TABLE)
    .where(eq(QUIZ_RESULTS_TABLE.createdBy, userEmail));

  // Compute statistics based on the filtered results
  const calculateStats = () => {
    if (!results.length) return { avgScore: 0, totalQuizzes: 0, bestScore: 0 };

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const bestScore = Math.max(...results.map((result) => result.score));

    return {
      avgScore: Math.round(totalScore / results.length),
      totalQuizzes: results.length,
      bestScore,
    };
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Quiz Results</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm text-gray-500">Average Score</h3>
          <p className="text-2xl font-bold">{stats.avgScore}%</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm text-gray-500">Total Quizzes</h3>
          <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm text-gray-500">Best Score</h3>
          <p className="text-2xl font-bold">{stats.bestScore}%</p>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Correct</TableHead>
              <TableHead>Incorrect</TableHead>
              <TableHead>Time Taken</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No quiz results found
                </TableCell>
              </TableRow>
            ) : (
              results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{format(new Date(result.timeStarted), "MMM d, yyyy")}</TableCell>
                  <TableCell>{result.courseId}</TableCell>
                  <TableCell>{result.score}%</TableCell>
                  <TableCell className="text-green-600">{result.correctAnswers}</TableCell>
                  <TableCell className="text-red-600">{result.incorrectAnswers}</TableCell>
                  <TableCell>
                    {formatDistance(new Date(result.timeStarted), new Date(result.timeCompleted), {
                      includeSeconds: true,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
