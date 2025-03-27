import { db } from "@/configs/db";
import { QUIZ_RESULTS_TABLE } from "@/configs/schema";
import { desc, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button"; // Shadcn UI's Button component

// This component is a server component in the App Router.
// It receives searchParams from Next.js.
export default async function LeaderboardPage({ searchParams }) {
  // Get the filter type from the URL query parameter, defaulting to "all"
  const filterType = searchParams.filter || "all";

  const now = new Date();
  let filterCondition;

  if (filterType === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    filterCondition = sql`${QUIZ_RESULTS_TABLE.createdAt} >= ${startOfWeek.toISOString()}`;
  } else if (filterType === "month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
    filterCondition = sql`${QUIZ_RESULTS_TABLE.createdAt} >= ${startOfMonth.toISOString()}`;
  } else {
    filterCondition = null; // All-time data (no date filter)
  }

  // Fetch leaderboard data with grouping and aggregate functions
  const leaderboard = await db
    .select({
      user: QUIZ_RESULTS_TABLE.createdBy,
      bestScore: sql`MAX(${QUIZ_RESULTS_TABLE.score})`.as("bestScore"),
      avgScore: sql`ROUND(AVG(${QUIZ_RESULTS_TABLE.score}), 2)`.as("avgScore"),
    })
    .from(QUIZ_RESULTS_TABLE)
    .where(filterCondition)
    .groupBy(QUIZ_RESULTS_TABLE.createdBy)
    .orderBy(desc(sql`MAX(${QUIZ_RESULTS_TABLE.score})`));

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <Link href="/profile" className="text-blue-500 hover:underline">
          ← Back to Profile
        </Link>
      </div>

      {/* Filter Options using Shadcn Outline Buttons */}
      <div className="mb-6 space-x-4">
        <Link href="/leaderboard?filter=all" passHref>
          <Button
            variant="outline"
            className={`transition-colors hover:bg-white hover:opacity-75 ${
              filterType === "all"
                ? "bg-slate-500 text-white"
                : "bg-transparent text-slate-500 border border-slate-500"
            }`}
          >
            All Time
          </Button>
        </Link>
        <Link href="/leaderboard?filter=week" passHref>
          <Button
            variant="outline"
            className={`transition-colors hover:bg-white hover:opacity-75 ${
              filterType === "week"
                ? "bg-slate-500 text-white"
                : "bg-transparent text-slate-500 border border-slate-500"
            }`}
          >
            This Week
          </Button>
        </Link>
        <Link href="/leaderboard?filter=month" passHref>
          <Button
            variant="outline"
            className={`transition-colors hover:bg-white hover:opacity-75 ${
              filterType === "month"
                ? "bg-slate-500 text-white"
                : "bg-transparent text-slate-500 border border-slate-500"
            }`}
          >
            This Month
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Best Score</TableHead>
              <TableHead>Average Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No quiz results found
                </TableCell>
              </TableRow>
            ) : (
              leaderboard.map((entry, index) => (
                <TableRow key={entry.user}>
                  <TableCell className="font-bold">#{index + 1}</TableCell>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>{entry.bestScore}%</TableCell>
                  <TableCell>{entry.avgScore}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
