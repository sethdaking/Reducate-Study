import { db } from "@/configs/db";
import { QUIZ_RESULTS_TABLE } from "@/configs/schema";
import { sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default async function LeaderboardPage() {
  // Fetch all users' best scores and ensure it's an array
  const leaderboard = await db.all(
    sql`
      SELECT created_by, MAX(score) AS best_score
      FROM ${QUIZ_RESULTS_TABLE}
      GROUP BY created_by
      ORDER BY best_score DESC
    `
  );

  // Ensure leaderboard is always an array
  const leaderboardArray = Array.isArray(leaderboard) ? leaderboard : [];

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
            {leaderboardArray.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No quiz results found
                </TableCell>
              </TableRow>
            ) : (
              leaderboardArray.map((entry, index) => (
                <TableRow key={entry.created_by}>
                  <TableCell className="font-bold">#{index + 1}</TableCell>
                  <TableCell>{entry.created_by}</TableCell>
                  <TableCell>{entry.best_score}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
