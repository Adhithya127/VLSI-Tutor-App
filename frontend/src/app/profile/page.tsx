"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/lib/auth-context";
import { getProgressOverview, getMe, type ProgressOverview, type User } from "@/lib/api/client";
import { Loader2, User as UserIcon, Mail, Calendar, Zap, Target, Trophy } from "lucide-react";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;
    Promise.all([
      getMe().catch(() => null),
      getProgressOverview().catch(() => null),
    ])
      .then(([p, ov]) => {
        setProfile(p);
        setProgress(ov);
      })
      .finally(() => setLoading(false));
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Please sign in to view your profile.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl">
      <PageHeader title="Profile" description="Your account information and stats." />

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{profile.display_name || profile.username}</p>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {profile.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {progress ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Zap className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-xl font-bold">{progress.total_xp}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <p className="text-xl font-bold">Level {progress.level}</p>
                  <p className="text-xs text-muted-foreground">Current Level</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Trophy className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xl font-bold">
                    {progress.completed_lessons}/{progress.total_lessons}
                  </p>
                  <p className="text-xs text-muted-foreground">Lessons Done</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Trophy className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-xl font-bold">
                    {progress.accuracy}%
                  </p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No stats yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Learning Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <p className="text-4xl font-bold">{progress?.streak_days ?? 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
              <p className="text-xs text-muted-foreground mt-2">
                Complete a lesson each day to build your streak.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
