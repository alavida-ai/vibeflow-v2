import React from 'react';

const About = () => {
  const features = [
    {
      title: "Built-in Optimizations",
      description: "Automatic image, font and script optimizations for improved UX and performance.",
      icon: "⚡"
    },
    {
      title: "Dynamic Content Streaming",
      description: "Instantly stream UI components as they render on the server with Suspense.",
      icon: "🔄"
    },
    {
      title: "Agent Server Components", 
      description: "Add components without sending additional JavaScript. Built on the latest React features.",
      icon: "🤖"
    },
    {
      title: "Data Fetching",
      description: "Make your React component async and await for your data. VibeFlow handles the rest.",
      icon: "📊"
    },
    {
      title: "CSS Support",
      description: "Style your application with your favorite tools, including support for CSS Modules, Sass, and more.",
      icon: "🎨"
    },
    {
      title: "Client and Server Rendering",
      description: "Flexible rendering and caching options, including Incremental Static Regeneration (ISR).",
      icon: "🔄"
    },
    {
      title: "Route Handlers",
      description: "Build API endpoints to securely connect with third party services for authentication, webhooks, and more.",
      icon: "🛣️"
    },
    {
      title: "Middleware",
      description: "Take control of the incoming request. Use code to define routing and access rules for authentication, experimentation, and internationalization.",
      icon: "🔧"
    },
    {
      title: "Advanced Routing & Nested Layouts",
      description: "Create routes using the file system, including support for more advanced routing patterns and UI layouts.",
      icon: "📁"
    }
  ];

  return (
    <section className="px-16 py-[120px] max-md:px-8 max-md:py-20 max-sm:px-4 max-sm:py-[60px]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-start gap-20 max-md:gap-10 max-sm:flex-col max-sm:gap-8 mb-16">
          <div className="flex-1">
            <h2 className="text-5xl font-bold leading-[56px] mb-6 max-md:text-[40px] max-md:leading-[48px] max-sm:text-[32px] max-sm:leading-10">
              What's VibeFlow?
            </h2>
          </div>
          <div className="flex-1">
            <p className="text-xl text-gray-300 leading-7 max-md:text-lg max-md:leading-[26px] max-sm:text-base max-sm:leading-6">
              Everything you need to build great marketing systems
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-full h-32 mb-6 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center group-hover:from-white/15 group-hover:to-white/10 transition-all duration-300">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="text-2xl">{feature.icon}</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-gray-100 transition-colors">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;