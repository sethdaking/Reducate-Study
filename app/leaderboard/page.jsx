import { db } from "@/configs/db";
import { QUIZ_RESULTS_TABLE } from "@/configs/schema";
import { desc, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default async function LeaderboardPage() {
  // Fetch leaderboard data
  const leaderboard = await db
    .select({
      user: QUIZ_RESULTS_TABLE.createdBy,
      bestScore: sql`MAX(${QUIZ_RESULTS_TABLE.score})`.as("bestScore"),
    })
    .from(QUIZ_RESULTS_TABLE)
    .groupBy(QUIZ_RESULTS_TABLE.createdBy)
    .orderBy(desc("bestScore"));

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <Link href="/profile" className="text-blue-500 hover:underline">
          ← Back to Profile
        </Link>
      </div>

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
                  No quiz results found
                </TableCell>
              </TableRow>
            ) : (
              leaderboard.map((entry, index) => (
                <TableRow key={entry.user}>
                  <TableCell className="font-bold">#{index + 1}</TableCell>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>{entry.bestScore}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
