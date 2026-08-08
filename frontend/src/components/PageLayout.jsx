import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommandBar from "@/components/CommandBar";
import NoticeTicker from "@/components/NoticeTicker";

export default function PageLayout({ children, showNotice = true, showFooter = true }) {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <Header />
      {showNotice && <NoticeTicker />}
      {children}
      {showFooter && <Footer />}
      <CommandBar />
    </div>
  );
}