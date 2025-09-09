import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-black text-white font-['Inter']">
        <main>
          <Hero />
          <About />
        </main>
      </div>
    </>
  );
};

export default Index;