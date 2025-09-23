import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 px-16 py-16 max-md:px-8 max-sm:px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Logo */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 24L16 8L24 24H8Z" fill="white"></path>
              </svg>
              <span className="text-xl font-semibold text-white">VibeFlow</span>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#docs" className="text-gray-400 hover:text-white transition-colors text-sm">Docs</a></li>
              <li><a href="#support" className="text-gray-400 hover:text-white transition-colors text-sm">Support Policy</a></li>
              <li><a href="#learn" className="text-gray-400 hover:text-white transition-colors text-sm">Learn</a></li>
              <li><a href="#showcase" className="text-gray-400 hover:text-white transition-colors text-sm">Showcase</a></li>
              <li><a href="#blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
              <li><a href="#team" className="text-gray-400 hover:text-white transition-colors text-sm">Team</a></li>
              <li><a href="#analytics" className="text-gray-400 hover:text-white transition-colors text-sm">Analytics</a></li>
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="text-white font-medium mb-4">More</h3>
            <ul className="space-y-3">
              <li><a href="#commerce" className="text-gray-400 hover:text-white transition-colors text-sm">VibeFlow Commerce</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Sales</a></li>
              <li><a href="#community" className="text-gray-400 hover:text-white transition-colors text-sm">Community</a></li>
              <li><a href="#github" className="text-gray-400 hover:text-white transition-colors text-sm">GitHub</a></li>
              <li><a href="#releases" className="text-gray-400 hover:text-white transition-colors text-sm">Releases</a></li>
              <li><a href="#telemetry" className="text-gray-400 hover:text-white transition-colors text-sm">Telemetry</a></li>
              <li><a href="#governance" className="text-gray-400 hover:text-white transition-colors text-sm">Governance</a></li>
            </ul>
          </div>

          {/* About VibeFlow */}
          <div>
            <h3 className="text-white font-medium mb-4">About VibeFlow</h3>
            <ul className="space-y-3">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">VibeFlow + Marketing</a></li>
              <li><a href="#open-source" className="text-gray-400 hover:text-white transition-colors text-sm">Open Source Software</a></li>
              <li><a href="#github" className="text-gray-400 hover:text-white transition-colors text-sm">GitHub</a></li>
              <li><a href="#twitter" className="text-gray-400 hover:text-white transition-colors text-sm">Twitter</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-medium mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#cookies" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Preferences</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-medium mb-4">Subscribe to our newsletter</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Stay updated on new releases and features, guides, and case studies.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="you@domain.com" 
                className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 flex-1 focus:outline-hidden focus:border-gray-500"
              />
              <button className="bg-white text-black text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-800 max-sm:flex-col max-sm:gap-4">
          <div className="text-gray-400 text-sm">
            © 2025 VibeFlow, Inc.
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Theme toggle"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;