import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Shield,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { StatsCard } from "../components/StatsCard";
import { RankCard } from "../components/RankCard";
import { AchievementBadge } from "../components/AchievementBadge";
import { AnimatedButton } from "../components/AnimatedButton";
import { useTheme } from "../context/ThemeContext";
import { staggerContainer, fadeInUp } from "../animations/variants";
import { achievementList } from "../data/achievements";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="glass-card p-3 rounded-lg border border-neon-green/20 text-sm">
      <p className="text-white font-mono mb-1">{label}</p>
      {data?.date && <p className="text-xs text-slate-400 font-mono mb-1">{data.date}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
      {data?.detail && (
        <p className="text-xs text-slate-400 mt-0.5 font-mono">
          Result: {data.detail} correct
        </p>
      )}
    </div>
  );
};

export const Dashboard = () => {
  const { simulationStats, quizScores, achievements } = useTheme();

  const chartData = (quizScores || []).map((q, idx) => {
    let formattedDate = "";
    if (q?.date) {
      const parsed = new Date(q.date);
      if (!isNaN(parsed.getTime())) {
        formattedDate = parsed.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      }
    }
    return {
      attempt: `Quiz ${idx + 1}`,
      score: typeof q?.pct === "number" ? q.pct : Math.round(((q?.score || 0) / (q?.total || 1)) * 100),
      date: formattedDate,
      detail: `${q?.score ?? 0}/${q?.total ?? 0}`,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle
        title="Analytics Dashboard"
        subtitle="Track your training progress and performance metrics"
        align="left"
      />

      {/* Cyber Defense Rank & Career Progression */}
      <RankCard />

      {/* User stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
      >
        {[
          { label: "Phishing Completed", value: simulationStats.phishingCompleted, icon: Shield },
          { label: "Websites Checked", value: simulationStats.websitesChecked, icon: Activity },
          { label: "Quizzes Taken", value: simulationStats.quizzesTaken, icon: TrendingUp },
          { label: "Investigations Completed", value: simulationStats.investigationsCompleted, icon: AlertTriangle },
          { label: "Scenarios Done", value: simulationStats.scenariosCompleted, icon: AlertTriangle },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <StatsCard icon={stat.icon} label={stat.label} value={stat.value || 0} color="text-neon-cyan" />
          </motion.div>
        ))}
      </motion.div>

      {/* Achievement badges */}
      <section className="mb-8">
        <SectionTitle
          title="Achievement Badges"
          subtitle="Unlock badges as you complete training modules"
          align="left"
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {achievementList.map((a) => (
            <motion.div key={a.id} variants={fadeInUp}>
              <AchievementBadge achievement={a} unlocked={achievements.includes(a.id)} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* User performance line */}
      <div className="mb-8">
        <CyberCard>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-white font-semibold">Training Performance Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quiz score trajectory across completed sessions</p>
            </div>
            {chartData.length > 0 && (
              <span className="text-xs font-mono text-neon-green bg-neon-green/10 px-2.5 py-1 rounded border border-neon-green/30">
                {chartData.length} {chartData.length === 1 ? "Session" : "Sessions"}
              </span>
            )}
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="attempt" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00ff88"
                  strokeWidth={2}
                  dot={{ fill: "#00ff88", r: 4 }}
                  activeDot={{ r: 6, fill: "#00d4ff" }}
                  name="Accuracy"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-12 text-center">
              <TrendingUp className="mx-auto text-slate-600 mb-3" size={40} />
              <p className="text-sm font-medium text-slate-300 mb-1">
                No quiz performance recorded yet
              </p>
              <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                Complete your first Cyber Safety Quiz to visualize your score progression and accuracy trend.
              </p>
              <AnimatedButton to="/cyber-quiz" icon={ChevronRight} variant="secondary">
                Take a Quiz
              </AnimatedButton>
            </div>
          )}
        </CyberCard>
      </div>

      {/* Quiz history */}
{quizScores.length > 0 ? (
  <CyberCard>
    <h3 className="text-white font-semibold mb-4">Your Quiz History</h3>
    <div className="space-y-2">
      {quizScores.map((q, i) => (
        <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
          <span className="text-slate-400 text-sm font-mono">
            {new Date(q.date).toLocaleDateString()}
          </span>
          <span className="text-neon-green font-mono">
            {q.score}/{q.total} ({q.pct}%)
          </span>
        </div>
      ))}
    </div>
  </CyberCard>
) : (
  <CyberCard>
    <div className="py-10 text-center">
      <ClipboardList className="mx-auto text-slate-500 mb-4" size={40} />

      <h3 className="text-white font-semibold mb-2">
        No quiz attempts yet!
      </h3>

      <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
        Complete your first Cyber Safety Quiz to track your scores.
      </p>

      <AnimatedButton to="/cyber-quiz" icon={ChevronRight} variant="secondary">
        Start Cyber Safety Quiz
      </AnimatedButton>
    </div>
  </CyberCard>
)}
    </div>
  );
};
