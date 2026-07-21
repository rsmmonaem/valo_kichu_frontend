"use client";

import React from 'react';
import { Mail, Target, Eye, Users } from 'lucide-react';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';

const teamMembers = [
  {
    id: 1,
    name: 'Rakib Hasan',
    designation: 'Founder & CEO',
    email: 'ceo@valokichu.com',
    image: 'https://i.pravatar.cc/300?img=11',
  },
  {
    id: 2,
    name: 'Sarah Rahman',
    designation: 'Head of Operations',
    email: 'sarah@valokichu.com',
    image: 'https://i.pravatar.cc/300?img=5',
  },
  {
    id: 3,
    name: 'Tanvir Ahmed',
    designation: 'Lead Developer',
    email: 'tanvir@valokichu.com',
    image: 'https://i.pravatar.cc/300?img=12',
  },
  {
    id: 4,
    name: 'Nusrat Jahan',
    designation: 'Marketing Director',
    email: 'nusrat@valokichu.com',
    image: 'https://i.pravatar.cc/300?img=9',
  }
];

export default function OurTeamsPage() {
  const { settings } = useSettings();

  const resolveImageUrl = (imgNameOrUrl: string) => {
      if (!imgNameOrUrl) return '';
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
      let cleanUrl = imgNameOrUrl;
      if (!imgNameOrUrl.startsWith('http')) {
          cleanUrl = `${baseUrl}/storage/${imgNameOrUrl.replace(/^\/?storage\/?/, '')}`;
      }
      return cleanUrl;
  };

  const parsedTeamMembers = (() => {
    try {
      if (!settings.our_teams_members) return teamMembers;
      const parsed = JSON.parse(settings.our_teams_members);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : teamMembers;
    } catch {
      return teamMembers;
    }
  })();

  const parsedWorkflowImages = (() => {
    try {
      if (!settings.our_workflow_images) return [];
      const parsed = JSON.parse(settings.our_workflow_images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (parsedWorkflowImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % parsedWorkflowImages.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [parsedWorkflowImages.length]);

  const mission = settings.our_teams_mission || "To empower consumers by providing authentic, high-quality products at competitive prices, while ensuring a seamless, fast, and secure digital shopping ecosystem across Bangladesh.";
  const vision = settings.our_teams_vision || "To be the most trusted and customer-centric e-commerce platform in the region, driving innovation and setting new standards for quality, service, and user satisfaction.";

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden">
      {/* Hero Section */}
      <div className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-4 tracking-wider uppercase">
            Meet the Minds
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            The Team Behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Valokichu</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 font-medium">
            We are a group of passionate individuals dedicated to delivering the best online shopping experience to our customers. 
          </p>
        </div>
      </div>

      {/* Workflow Section */}
      {parsedWorkflowImages.length > 0 && (
        <div className="py-12 bg-white/50 backdrop-blur-sm border-y border-slate-200/50 mb-20 overflow-hidden">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Our Work Process</h2>
          </div>
          
          {/* Slider Container */}
          <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-lg border border-slate-100 bg-white p-2">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {parsedWorkflowImages.map((img: any, idx: number) => (
                <div key={idx} className="w-full flex-shrink-0 flex items-center justify-center p-2">
                  <div className="w-full h-64 md:h-[400px] lg:h-[500px] relative rounded-xl overflow-hidden bg-slate-50">
                    <img 
                      src={resolveImageUrl(img.image)} 
                      className="w-full h-full object-contain" 
                      alt={`Workflow step ${idx + 1}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Dots indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200">
              {parsedWorkflowImages.map((_: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-blue-600 scale-125' : 'bg-slate-400 hover:bg-slate-600'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 pb-20">
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

      {/* Team Section */}
      <div className="bg-white/50 backdrop-blur-sm py-20 border-t border-slate-200/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 flex items-center justify-center gap-3">
              <Users className="text-blue-600" />
              Our Leadership
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {parsedTeamMembers.map((member: any, idx: number) => (
              <div 
                key={member.id || idx} 
                className="bg-white rounded-3xl p-6 text-center shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img 
                    src={resolveImageUrl(member.image) || 'https://i.pravatar.cc/300?img=11'} 
                    alt={member.name} 
                    className="w-full h-full object-cover rounded-full border-4 border-white relative z-10"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-4">{member.designation}</p>
                <div className="w-full h-px bg-slate-100 mb-4"></div>
                <a 
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  <Mail size={16} />
                  {member.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
