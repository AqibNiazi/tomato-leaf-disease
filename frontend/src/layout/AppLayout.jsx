import React from "react";
import { Outlet } from "react-router-dom";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background layers */}
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ── Navbar ── */}
      <Navbar />
      {/* ── Main content ── */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
