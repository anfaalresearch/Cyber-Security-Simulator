import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/Home";
import { PhishingSimulator } from "../pages/PhishingSimulator";
import { FakeWebsiteDetector } from "../pages/FakeWebsiteDetector";
import { PasswordAnalyzer } from "../pages/PasswordAnalyzer";
import { CyberQuiz } from "../pages/CyberQuiz";
import { CustomQuizBuilder } from "../pages/CustomQuizBuilder";
import { AttackSimulation } from "../pages/AttackSimulation";
import { AttackPathExplorer } from "../pages/AttackPathExplorer";
import { Dashboard } from "../pages/Dashboard";
import { About } from "../pages/About";
import { NotFound } from "../pages/NotFound";
import { IncidentInvestigation } from "../pages/IncidentInvestigation";
import { CyberNews } from "../pages/CyberNews";

export const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="phishing-simulator" element={<PhishingSimulator />} />
      <Route path="fake-website-detector" element={<FakeWebsiteDetector />} />
      <Route path="password-analyzer" element={<PasswordAnalyzer />} />
      <Route path="cyber-quiz" element={<CyberQuiz />} />
      <Route path="custom-quiz" element={<CustomQuizBuilder />} />
      <Route path="attack-simulation" element={<AttackSimulation />} />
      <Route path="attack-paths" element={<AttackPathExplorer />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="about" element={<About />} />
      <Route path="incident-investigation" element={<IncidentInvestigation />} />
      <Route path="cyber-news" element={<CyberNews />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);
