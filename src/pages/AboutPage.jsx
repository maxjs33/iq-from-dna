import React from 'react';
import { Target, Shield, BookOpen, Heart, Users, Award, User } from 'lucide-react';

const AboutPage = () => (
  <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center mb-16">
      <h1 className="text-5xl font-bold text-white mb-6">About Us</h1>
      <p className="text-xl text-slate-300 max-w-3xl mx-auto">Making advances in genomic science accessible and meaningful to individuals</p>
    </div>

    <div className="grid md:grid-cols-2 gap-12 mb-16">
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
        <Target className="w-12 h-12 text-purple-400 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-slate-300">At ThinQ, we're committed to making advances in genomic science accessible and meaningful to individuals. By translating complex genetic data into understandable insights about cognitive potential, we aim to empower people with knowledge that can inform educational and personal development decisions.</p>
      </div>
      
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
        <Shield className="w-12 h-12 text-purple-400 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Our Approach</h2>
        <p className="text-slate-300">We believe in the responsible application of genetic science. Our approach is research-driven, transparent, privacy-focused, and educational. We clearly communicate what our estimates can and cannot tell you, including their limitations.</p>
      </div>
    </div>

    <div className="mb-16">
      <h2 className="text-3xl font-bold text-white text-center mb-12">Our Team</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { name: "Dr. Sarah Johnson", role: "Computational Geneticist", description: "Ph.D. in Genomic Science with 10+ years of experience in polygenic scoring methods." },
          { name: "Prof. Michael Chen", role: "Psychometrician", description: "Leading researcher with 50+ published papers on cognitive assessment methodologies." },
          { name: "Dr. Rebecca Torres", role: "Neuroscientist", description: "Specializes in neural correlates of intelligence and biological basis of cognitive differences." },
          { name: "Alex Matthews", role: "Data Privacy Officer", description: "Expert in bioethics and genetic privacy, ensuring highest standards of data protection." }
        ].map((member, idx) => (
          <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
            <p className="text-purple-400 text-sm mb-3">{member.role}</p>
            <p className="text-slate-300 text-sm">{member.description}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: <BookOpen className="w-8 h-8" />, title: "Scientific Integrity", description: "Rigorous scientific standards and transparency about capabilities and limitations." },
        { icon: <Heart className="w-8 h-8" />, title: "Ethical Practice", description: "Strict ethical guidelines in handling genetic data and presenting results." },
        { icon: <Users className="w-8 h-8" />, title: "Accessibility", description: "Making scientific advances understandable and accessible to all." },
        { icon: <Award className="w-8 h-8" />, title: "Individual Empowerment", description: "Providing information for informed personal development decisions." }
      ].map((value, idx) => (
        <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
          <div className="text-purple-400 mb-4">{value.icon}</div>
          <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
          <p className="text-slate-300 text-sm">{value.description}</p>
        </div>
      ))}
    </div>
  </div>
);

export default AboutPage;
