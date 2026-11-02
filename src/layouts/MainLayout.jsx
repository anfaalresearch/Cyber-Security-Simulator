import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";
import { LevelUpModal } from "../components/LevelUpModal";
import { pageTransition } from "../animations/variants";

export const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col animated-gradient cyber-grid-bg">
      <Navbar />
      <LevelUpModal />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};
