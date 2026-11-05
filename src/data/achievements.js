import { Trophy, Shield, Target, Star, Zap, Award } from "lucide-react";

export const achievementList = [
  {
    id: "first-quiz",
    title: "First Steps",
    description: "Complete your first cyber safety quiz",
    icon: Star,
    color: "text-neon-cyan",
  },
  {
    id: "perfect-quiz",
    title: "Perfect Score",
    description: "Score 100% on any quiz",
    icon: Trophy,
    color: "text-neon-green",
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Score 80% or higher on a quiz",
    icon: Award,
    color: "text-warning",
  },
  {
    id: "phishing-hunter",
    title: "Phishing Hunter",
    description: "Complete the phishing email simulator",
    icon: Shield,
    color: "text-neon-green",
  },
  {
    id: "password-pro",
    title: "Password Pro",
    description: "Create a strong password (score 8+)",
    icon: Zap,
    color: "text-neon-cyan",
  },
  {
    id: "scenario-survivor",
    title: "Scenario Survivor",
    description: "Complete all attack simulations",
    icon: Target,
    color: "text-neon-purple",
  },

    {
    id: "incident-investigator",
    title: "Evidence Analyst",
    description: "Correctly investigate a security incident",
    icon: Shield,
    color: "text-neon-purple",
  },
];
