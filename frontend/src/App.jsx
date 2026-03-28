import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { AnalyzePage } from "@/pages/AnalyzePage";
import { HistoryPage } from "@/pages/HistoryPage";
import { ClassesPage } from "@/pages/ClassesPage";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};
const pageTransition = { duration: 0.25, ease: "easeInOut" };

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <AnimatedPage>
                  <DashboardPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/analyze"
              element={
                <AnimatedPage>
                  <AnalyzePage />
                </AnimatedPage>
              }
            />
            <Route
              path="/history"
              element={
                <AnimatedPage>
                  <HistoryPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/classes"
              element={
                <AnimatedPage>
                  <ClassesPage />
                </AnimatedPage>
              }
            />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </BrowserRouter>
  );
}
