"use client";

import React from 'react';
import { Target, Eye } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function MissionVisionPage() {
  const { settings } = useSettings();

  const mission = settings.our_teams_mission || "To empower consumers by providing authentic, high-quality products at competitive prices, while ensuring a seamless, fast, and secure digital shopping ecosystem across Bangladesh.";
  const vision = settings.our_teams_vision || "To be the most trusted and customer-centric e-commerce platform in the region, driving innovation and setting new standards for quality, service, and user satisfaction.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden">
      {/* Hero Section */}
      <div className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-4 tracking-wider uppercase">
            Purpose & Core Values
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Mission & Vision</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 font-medium">
            Building trust and delivering excellence to enhance user experiences and drive innovation.
          </p>
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="container mx-auto px-4 pb-28">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Mission */}
          <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-white/50 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500"></div>
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
              {mission}
            </p>
          </div>
          
          {/* Vision */}
          <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-xl shadow-purple-900/5 border border-white/50 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500"></div>
            <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-600/30">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
              {vision}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
