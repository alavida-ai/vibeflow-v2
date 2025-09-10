import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Roadmap = () => {
  const roadmapItems = [
    {
      title: "Project Initialization",
      description: "Core framework setup with basic routing, authentication scaffolding, and initial component library integration.",
      status: "completed",
      date: "Q1 2024"
    },
    {
      title: "Basic Marketing Dashboard",
      description: "Essential analytics tracking and basic campaign management interface.",
      status: "completed",
      date: "Q1 2024"
    },
    {
      title: "AI Campaign Tools",
      description: "Intelligent campaign optimization and automated A/B testing capabilities.",
      status: "in-progress",
      date: "Q2 2024"
    },
    {
      title: "Advanced Workflow Builder",
      description: "Visual workflow designer with drag-and-drop interface for complex marketing automations.",
      status: "planned",
      date: "Q2 2024"
    },
    {
      title: "Collaboration Features",
      description: "Team management, role-based permissions, and real-time collaboration tools.",
      status: "planned",
      date: "Q3 2024"
    },
    {
      title: "Advanced Analytics Platform",
      description: "Comprehensive reporting dashboard with predictive analytics and custom visualization tools.",
      status: "completed",
      date: "Q3 2024"
    },
    {
      title: "Multi-Channel Integration",
      description: "Native integrations with major platforms including social media, email, and advertising networks.",
      status: "planned",
      date: "Q3 2024"
    },
    {
      title: "Performance Optimization & Scaling",
      description: "Infrastructure improvements for enterprise-scale deployments and enhanced performance.",
      status: "planned",
      date: "Q4 2024"
    },
    {
      title: "Advanced Machine Learning",
      description: "Custom ML models for predictive customer behavior analysis and automated optimization.",
      status: "planned",
      date: "Q4 2024"
    },
    {
      title: "Mobile Applications",
      description: "Native iOS and Android applications with offline capabilities and push notifications.",
      status: "planned",
      date: "Q1 2025"
    },
    {
      title: "Enterprise Security & Compliance",
      description: "Advanced security features, audit logs, and compliance tools for enterprise customers.",
      status: "completed",
      date: "Q1 2025"
    },
    {
      title: "API Ecosystem & Marketplace",
      description: "Public API platform with third-party integrations and community marketplace.",
      status: "planned",
      date: "Q2 2025"
    },
    {
      title: "Global Expansion Features",
      description: "Multi-language support, regional compliance, and localized marketing tools.",
      status: "planned",
      date: "Q2 2025"
    }
  ];

  return (
      <div className="flex flex-col">
        <main className="px-16 py-[120px] max-md:px-8 max-md:py-20 max-sm:px-4 max-sm:py-[60px]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6 max-md:text-4xl max-sm:text-3xl">
                Roadmap
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto max-md:text-lg max-sm:text-base">
                Our development roadmap outlines the planned features and improvements for VibeFlow. 
                Check back regularly for updates on our progress and new feature releases.
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800"></div>
              
              <div className="space-y-8">
                {roadmapItems.map((item, index) => (
                  <div key={index} className="relative flex items-start gap-8">
                    {/* Timeline dot */}
                    <div className={`relative z-10 w-3 h-3 rounded-full mt-2 ${
                      item.status === 'completed' 
                        ? 'bg-green-500' 
                        : item.status === 'in-progress'
                        ? 'bg-blue-500'
                        : 'bg-gray-600'
                    }`}>
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 p-6 rounded-xl border transition-all duration-300 hover:border-gray-600 ${
                      item.status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30'
                        : item.status === 'in-progress'
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-gray-900/50 border-gray-800'
                    }`}>
                      <div className="flex items-start justify-between mb-3 max-sm:flex-col max-sm:gap-2">
                        <h3 className="text-xl font-semibold text-white">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : item.status === 'in-progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-600/20 text-gray-400'
                          }`}>
                            {item.status === 'completed' ? 'Completed' : 
                             item.status === 'in-progress' ? 'In Progress' : 'Planned'}
                          </span>
                          <span className="text-sm text-gray-500 font-mono">
                            {item.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">
                Have suggestions for our roadmap?
              </h3>
              <p className="text-gray-300 mb-4">
                We'd love to hear your ideas and feedback on our upcoming features.
              </p>
              <button className="bg-white text-black text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                Submit Feedback
              </button>
            </div>
          </div>
        </main>
      </div>
  );
};

export default Roadmap;