import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, Store, CreditCard, Settings,
  Bell, AlertCircle, MessageSquare, LogOut, Home } from
"lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
{ id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin-backend" },
{ id: "products", label: "Products", icon: Package, path: "/admin-backend?tab=products" },
{ id: "sellers", label: "Sellers", icon: Store, path: "/admin-backend?tab=sellers" },
{ id: "payments", label: "Payments", icon: CreditCard, path: "/admin-backend?tab=payments" },
{ id: "config", label: "Platform Config", icon: Settings, path: "/admin-backend?tab=config" },
{ id: "notices", label: "Notices", icon: Bell, path: "/admin-backend?tab=notices" },
{ id: "concerns", label: "Concerns", icon: AlertCircle, path: "/admin-backend?tab=concerns" },
{ id: "chat", label: "Chat", icon: MessageSquare, path: "/admin-backend?tab=chat" }];

export default function AdminLayout({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/5 bg-[#0F0F11] fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            

            
            <div>
              <span className="text-white font-bold text-sm block">RentHub</span>
              
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) =>
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            activeTab === item.id ?
            "bg-[#2E5BFF] text-white font-medium" :
            "text-zinc-500 hover:text-white hover:bg-white/5"}`
            }>
            
              <item.icon size={16} />
              {item.label}
            </button>
          )}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
            
            <Home size={16} /> View Site
          </Link>
          <button
            onClick={() => base44.auth.logout("/login")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors">
            
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-[#0F0F11] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2E5BFF] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <span className="text-white font-bold text-sm">RentHub Backend</span>
        </Link>
        <Link to="/" className="text-zinc-500 hover:text-white">
          <Home size={18} />
        </Link>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0F0F11] border-t border-white/5 px-2 py-2 overflow-x-auto">
        <div className="flex gap-1">
          {navItems.map((item) =>
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[9px] whitespace-nowrap transition-colors ${
            activeTab === item.id ? "text-[#2E5BFF]" : "text-zinc-600"}`
            }>
            
              <item.icon size={16} />
              {item.label}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-60 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6 md:p-8 max-w-6xl">
          
          {children}
        </motion.div>
      </main>
    </div>);

}
