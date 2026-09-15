import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const features = [
  {
    title: "Adaptive Curriculum",
    description:
      "Personalized learning paths from electronics fundamentals to advanced Physical Design.",
  },
  {
    title: "AI Tutor",
    description:
      "Socratic, voice-enabled tutor that adapts to your understanding and misconceptions.",
  },
  {
    title: "Interactive Simulations",
    description:
      "Circuit simulations, waveform visualization, and Physical Design exploration.",
  },
  {
    title: "Engineering Challenges",
    description:
      "Real-world problems: fix timing violations, optimize power, debug RTL.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Early Access
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Build a World-Class
          <br />
          VLSI Engineer
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          AI-native learning platform taking you from absolute fundamentals to
          advanced ASIC Physical Design and real-world engineering.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button render={<Link href="/dashboard" />} size="lg">
            Start Learning
          </Button>
          <Button render={<Link href="/journey" />} variant="outline" size="lg">
            View Curriculum
          </Button>
        </div>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 max-w-2xl w-full">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
