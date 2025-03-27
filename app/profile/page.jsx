import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/configs/db"; // Drizzle instance
import { QUIZ_RESULTS_TABLE } from "@/configs/schema";
import { format, formatDistance, differenceInDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { eq } from "drizzle-orm";
import Link from "next/link";

// Lucide icons for badges
import { CheckCircle, Flame, Star, Award, Heart, Shield, Lightbulb, Medal, ClipboardCheck, MessageCircle, Paperclip, FlameIcon } from 'lucide-react';

// Function to calculate streak
const calculateStreak = (results) => {
  if (!results.length) return 0;

  results.sort((a, b) => new Date(b.timeStarted) - new Date(a.timeStarted)); // Sort by most recent
  let streak = 1;
  
  for (let i = 0; i < results.length - 1; i++) {
    const diff = differenceInDays(new Date(results[i].timeStarted), new Date(results[i + 1].timeStarted));
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break; // Streak broken
    }
  }
  
  return streak;
};

// Function to calculate badges
const getBadges = (results) => {
  const totalQuizzes = results.length;
  const hasPerfectScore = results.some((r) => r.score === 100);
  const streak = calculateStreak(results);
  
  let badges = [];
  if (totalQuizzes >= 1) badges.push({ name: "First Quiz 🎉", icon: <CheckCircle className="h-6 w-6 text-blue-500" /> });
  if (totalQuizzes >= 10) badges.push({ name: "Quiz Enthusiast 🏆", icon: <Medal className="h-6 w-6 text-yellow-500" /> });
  if (hasPerfectScore) badges.push({ name: "Perfectionist 💯", icon: <CheckCircle className="h-6 w-6 text-green-500" /> });
  if (streak >= 7) badges.push({ name: "Consistency Master 🔥", icon: <Flame className="h-6 w-6 text-red-500" /> });
  if (totalQuizzes >= 50) badges.push({ name: "Legend 🌟", icon: <Star className="h-6 w-6 text-purple-500" /> });
  
  // Additional badges
  if (totalQuizzes >= 100) badges.push({ name: "Quiz God 🧠", icon: <Award className="h-6 w-6 text-indigo-500" /> });
  if (streak >= 30) badges.push({ name: "Streak King 👑", icon: <Shield className="h-6 w-6 text-teal-500" /> });
  if (hasPerfectScore && totalQuizzes >= 20) badges.push({ name: "Mastermind 🧠", icon: <Lightbulb className="h-6 w-6 text-yellow-600" /> });
  if (totalQuizzes >= 5) badges.push({ name: "Rising Star 🌟", icon: <Heart className="h-6 w-6 text-pink-500" /> });
  if (totalQuizzes >= 25) badges.push({ name: "Quiz Wizard ✨", icon: <ClipboardCheck className="h-6 w-6 text-blue-400" /> });
  if (hasPerfectScore && totalQuizzes >= 50) badges.push({ name: "Top Performer 🏅", icon: <MessageCircle className="h-6 w-6 text-orange-500" /> });
  if (streak >= 14) badges.push({ name: "Double Streak King 🔥", icon: <Paperclip className="h-6 w-6 text-teal-500" /> });

  // 20 new badges
  if (totalQuizzes >= 200) badges.push({ name: "Quiz Master 🧙‍♂️", icon: <Award className="h-6 w-6 text-pink-700" /> });
  if (totalQuizzes >= 500) badges.push({ name: "Quiz Overlord 👑", icon: <Flame className="h-6 w-6 text-red-700" /> });
  if (streak >= 60) badges.push({ name: "Ultimate Streak 🏆", icon: <Star className="h-6 w-6 text-yellow-700" /> });
  if (results.length >= 5) badges.push({ name: "Early Bird 🌅", icon: <Heart className="h-6 w-6 text-orange-500" /> });
  if (totalQuizzes >= 10) badges.push({ name: "Frequent Quizzer 💡", icon: <ClipboardCheck className="h-6 w-6 text-teal-600" /> });
  if (streak >= 5) badges.push({ name: "Streak Builder ⚒️", icon: <FlameIcon className="h-6 w-6 text-yellow-500" /> });
  if (hasPerfectScore && streak >= 7) badges.push({ name: "Perfect Streak 🌟", icon: <CheckCircle className="h-6 w-6 text-indigo-600" /> });
  if (results.some(r => r.score >= 90)) badges.push({ name: "High Achiever 💪", icon: <CheckCircle className="h-6 w-6 text-purple-600" /> });
  if (results.some(r => r.timeTaken < 30)) badges.push({ name: "Speedster 🏃", icon: <Lightbulb className="h-6 w-6 text-teal-500" /> });
  if (results.some(r => r.correctAnswers > 15)) badges.push({ name: "Accuracy King 👑", icon: <ClipboardCheck className="h-6 w-6 text-red-500" /> });
  if (totalQuizzes >= 2) badges.push({ name: "Double Trouble 🔥", icon: <Flame className="h-6 w-6 text-blue-500" /> });
  if (totalQuizzes >= 30) badges.push({ name: "Quiz Champion 🏆", icon: <Award className="h-6 w-6 text-purple-500" /> });
  if (totalQuizzes >= 75) badges.push({ name: "Quiz Hero 🌟", icon: <Star className="h-6 w-6 text-orange-400" /> });
  if (streak >= 90) badges.push({ name: "Legendary Streak 🔥", icon: <Shield className="h-6 w-6 text-indigo-700" /> });
  if (results.every(r => r.score === 100)) badges.push({ name: "Flawless 🏅", icon: <Star className="h-6 w-6 text-gray-800" /> });
  if (totalQuizzes >= 1000) badges.push({ name: "Quiz God 🧠", icon: <Flame className="h-6 w-6 text-teal-700" /> });
  if (totalQuizzes >= 2000) badges.push({ name: "Quiz Legend 🌟", icon: <Award className="h-6 w-6 text-blue-800" /> });
  if (totalQuizzes >= 5000) badges.push({ name: "Quiz Titan 💪", icon: <Medal className="h-6 w-6 text-red-800" /> });
  if (streak >= 180) badges.push({ name: "Eternal Streak 🔥", icon: <Shield className="h-6 w-6 text-blue-600" /> });

  return badges;
};

// Function to check completed badges
const checkCompletedBadges = (userBadges, allBadges) => {
  return allBadges.map(badge => {
    return {
      name: badge.name,
      isCompleted: userBadges.some(userBadge => userBadge.name === badge.name),
      badgeIcon: badge.icon,
    };
  });
};

export default async function QuizResultsPage() {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <p>No user is logged in.</p>
      </div>
    );
  }

  const userName = user.firstName;

  const results = await db
    .select()
    .from(QUIZ_RESULTS_TABLE)
    .where(eq(QUIZ_RESULTS_TABLE.createdBy, userName));

  const stats = {
    avgScore: results.length ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
    totalQuizzes: results.length,
    bestScore: results.length ? Math.max(...results.map((r) => r.score)) : 0,
    streak: calculateStreak(results),
  };

  const allBadges = getBadges(results);
  const completedBadges = checkCompletedBadges(allBadges, allBadges);

  const achievedBadges = completedBadges.filter(badge => badge.isCompleted);
  const unachievedBadges = completedBadges.filter(badge => !badge.isCompleted);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Quiz Results</h1>

      <Link href="/leaderboard" className="text-blue-500 hover:underline">
        View Leaderboard → 
      </Link>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        <Card className="p-6">
          <h3 className="text-sm text-gray-500">Streak 🔥</h3>
          <p className="text-2xl font-bold">{stats.streak} days</p>
        </Card>
      </div>

      {/* Badge System */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Achieved Badges 🏅</h2>
        <Card className="p-6">
          {achievedBadges.length === 0 ? (
            <p className="text-gray-500">No badges earned yet. Keep going! 🚀</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {achievedBadges.map((badge, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {badge.badgeIcon}
                  <span className="font-semibold text-green-500">{badge.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Unachieved Badges 🏅</h2>
        <Card className="p-6">
          {unachievedBadges.length === 0 ? (
            <p className="text-gray-500">You've earned all badges! Great job! 🎉</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {unachievedBadges.map((badge, index) => (
                <div key={index} className="flex items-center space-x-2 opacity-60">
                  {badge.badgeIcon}
                  <span className="font-semibold text-gray-500">{badge.name}</span>
                </div>
              ))}
            </div>
          )}
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
