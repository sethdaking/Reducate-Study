import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/configs/db"; // Import your Drizzle instance
import { QUIZ_RESULTS_TABLE } from "@/configs/schema"; // Import your table schema
import { format, formatDistance } from "date-fns";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";

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
  const userName = user.firstName;
  
  // Fetch quiz results for the current user
  const results = await db
    .select()
    .from(QUIZ_RESULTS_TABLE)
    .where(eq(QUIZ_RESULTS_TABLE.createdBy, userName));

  // Compute user statistics
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

  // Fetch leaderboard (top users by highest score)
  const leaderboard = await db
  .select({
    user: QUIZ_RESULTS_TABLE.createdBy, // This now refers to firstName instead of email
    bestScore: sql`MAX(${QUIZ_RESULTS_TABLE.score})`.as("bestScore"),
  })
  .from(QUIZ_RESULTS_TABLE)
  .groupBy(QUIZ_RESULTS_TABLE.createdBy)
  .orderBy(desc("bestScore"))
  .limit(5);


  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Quiz Results</h1>

      <Link href="/leaderboard" className="text-blue-500 hover:underline">
          View Leaderboard →
        </Link>

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

      {/* Leaderboard */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Best Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No leaderboard data available
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard.map((entry, index) => (
                  <TableRow key={entry.user}>
                    <TableCell>#{index + 1}</TableCell>
                    <TableCell>{entry.user || "Unknown User"}</TableCell>
                    <TableCell className="text-green-600">{entry.bestScore}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Results Table */}
      <h2 className="text-2xl font-semibold mb-4">Your Quiz History</h2>
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
