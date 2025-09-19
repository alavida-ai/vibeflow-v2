# Sample Workflows

These real-world workflow examples will help you understand how to break down complex marketing goals into manageable, automated processes.

## Content Marketing Workflows

### 1. Blog Post Creation & Distribution

**Use Case:** Create SEO-optimized blog posts and distribute them across multiple channels

```yaml
name: "Blog Post Creation & Distribution"
description: "Research, write, optimize, and distribute blog content"
category: "content-marketing"

steps:
  - name: "Topic Research & Validation"
    instructions: |
      Research the given topic and validate its potential:
      1. Analyze search volume and keyword difficulty
      2. Identify 3-5 related keywords to target
      3. Find 3-5 competing articles and gaps we can fill
      4. Suggest unique angles based on our brand positioning
    acceptance_criteria: |
      - Primary keyword with search volume data
      - List of related keywords (LSI)
      - Competitive analysis with 3-5 examples
      - Unique angle recommendation
    agents: ["research-agent"]
    tools: ["web-search", "seo-tools"]

  - name: "Content Outline Creation"
    instructions: |
      Create a detailed outline based on research:
      1. Structure with H2/H3 headings
      2. Include target keywords naturally
      3. Add CTA placement recommendations
      4. Ensure alignment with brand voice guidelines
    acceptance_criteria: |
      - Detailed outline with 6-8 main sections
      - Keywords integrated naturally
      - Brand voice elements included
      - CTA strategy defined
    agents: ["content-agent"]
    dependencies: ["Topic Research & Validation"]

  - name: "Draft Writing"
    instructions: |
      Write the full blog post following the approved outline:
      1. Target 1500-2500 words
      2. Include internal links to our existing content
      3. Add external links to credible sources
      4. Optimize for featured snippets
      5. Include meta description and title tag
    acceptance_criteria: |
      - 1500-2500 word count
      - 3-5 internal links included
      - 2-3 external authority links
      - Meta description under 160 characters
      - SEO title under 60 characters
    agents: ["content-agent"]
    dependencies: ["Content Outline Creation"]

  - name: "Social Media Adaptation"
    instructions: |
      Create platform-specific social media posts:
      1. LinkedIn professional post (150-200 words)
      2. Twitter thread (5-7 tweets)
      3. Instagram carousel concept (5 slides)
      4. Include relevant hashtags for each platform
    acceptance_criteria: |
      - LinkedIn post with professional tone
      - Twitter thread with engaging hook
      - Instagram carousel slide concepts
      - Platform-specific hashtags (10-15 per platform)
    agents: ["social-agent"]
    dependencies: ["Draft Writing"]

  - name: "Performance Tracking Setup"
    instructions: |
      Set up tracking for the content campaign:
      1. Create UTM parameters for social shares
      2. Set up Google Analytics goals
      3. Define success metrics and benchmarks
      4. Schedule performance review in 30 days
    acceptance_criteria: |
      - UTM codes for all distribution channels
      - Analytics goals configured
      - Success metrics defined (traffic, engagement, conversions)
      - Follow-up tracking scheduled
    agents: ["analytics-agent"]
    dependencies: ["Social Media Adaptation"]
```

### 2. Lead Magnet Creation Campaign

**Use Case:** Create a comprehensive lead magnet with landing page and email sequence

```yaml
name: "Lead Magnet Creation Campaign"
description: "Develop high-converting lead magnets with complete funnel"
category: "lead-generation"

steps:
  - name: "Audience Pain Point Research"
    instructions: |
      Identify the most pressing challenges for our target audience:
      1. Analyze customer support tickets and common questions
      2. Research competitor lead magnets and gaps
      3. Survey social media groups and forums
      4. Validate pain points against our solution capabilities
    acceptance_criteria: |
      - 3-5 validated pain points with evidence
      - Competitive gap analysis
      - Pain point ranking by urgency/frequency
      - Solution mapping to our product/service
    agents: ["research-agent"]
    tools: ["web-search", "social-monitoring"]

  - name: "Lead Magnet Concept Development"
    instructions: |
      Design the lead magnet concept:
      1. Choose format (ebook, checklist, template, video series)
      2. Create detailed outline with 5-7 key sections
      3. Design value proposition and positioning
      4. Plan visual elements and design requirements
    acceptance_criteria: |
      - Format selected with justification
      - Detailed content outline
      - Clear value proposition statement
      - Visual design brief
    agents: ["content-agent"]
    dependencies: ["Audience Pain Point Research"]

  - name: "Content Creation"
    instructions: |
      Create the complete lead magnet content:
      1. Write all copy following brand voice guidelines
      2. Include actionable steps and practical advice
      3. Add compelling visuals and design elements
      4. Ensure mobile-friendly formatting
    acceptance_criteria: |
      - Complete content in chosen format
      - Branded design elements included
      - Mobile-responsive layout
      - Actionable advice with clear next steps
    agents: ["content-agent"]
    dependencies: ["Lead Magnet Concept Development"]

  - name: "Landing Page Creation"
    instructions: |
      Develop high-converting landing page:
      1. Write compelling headline and subheadline
      2. Create benefit-focused copy (not feature-focused)
      3. Design social proof elements
      4. Optimize form fields (name + email only)
      5. Create mobile-responsive design
    acceptance_criteria: |
      - Compelling headline testing 2-3 variations
      - Benefit-driven copy under 300 words
      - Social proof elements included
      - Simple lead capture form
      - Mobile optimization confirmed
    agents: ["content-agent", "conversion-agent"]
    dependencies: ["Content Creation"]

  - name: "Email Nurture Sequence"
    instructions: |
      Create 5-email nurture sequence:
      1. Immediate delivery email with lead magnet
      2. Value-add email #1 (related tip/insight)
      3. Value-add email #2 (case study or example)
      4. Soft pitch email (introduce solution)
      5. Direct CTA email (clear next step)
    acceptance_criteria: |
      - 5 complete emails with subject lines
      - Consistent brand voice throughout
      - Progressive value delivery
      - Clear CTAs in each email
      - Personalization placeholders included
    agents: ["content-agent", "email-agent"]
    dependencies: ["Landing Page Creation"]
```

## Social Media Workflows

### 3. Multi-Platform Social Campaign

**Use Case:** Launch coordinated social media campaign across all platforms

```yaml
name: "Multi-Platform Social Campaign"
description: "Coordinate social media campaigns across LinkedIn, Twitter, and Instagram"
category: "social-media"

steps:
  - name: "Campaign Strategy Development"
    instructions: |
      Develop comprehensive social media campaign strategy:
      1. Define campaign objectives and KPIs
      2. Identify target audience for each platform
      3. Create content themes and messaging pillars
      4. Plan posting schedule and frequency
      5. Set budget allocation per platform
    acceptance_criteria: |
      - Clear campaign objectives with measurable KPIs
      - Platform-specific audience profiles
      - 3-5 content themes defined
      - Posting calendar for 30 days
      - Budget allocation breakdown
    agents: ["social-agent", "strategy-agent"]

  - name: "Content Calendar Creation"
    instructions: |
      Create detailed content calendar:
      1. Plan 30 days of content across all platforms
      2. Ensure content variety (educational, promotional, engaging)
      3. Include relevant holidays and industry events
      4. Plan user-generated content opportunities
      5. Schedule optimal posting times for each platform
    acceptance_criteria: |
      - 30-day content calendar
      - 70% educational, 20% promotional, 10% engaging content mix
      - Industry events and holidays included
      - Platform-specific optimal timing
      - UGC opportunities identified
    agents: ["social-agent", "content-agent"]
    dependencies: ["Campaign Strategy Development"]

  - name: "Platform-Specific Content Creation"
    instructions: |
      Create content optimized for each platform:
      
      LinkedIn:
      - Professional insights and industry commentary
      - Company culture and behind-the-scenes content
      - Thought leadership articles
      
      Twitter:
      - Quick tips and insights
      - Industry news commentary
      - Engaging questions and polls
      
      Instagram:
      - Visual storytelling content
      - Behind-the-scenes photos/videos
      - User-generated content features
    acceptance_criteria: |
      - 30 LinkedIn posts with professional tone
      - 30 Twitter posts with engaging elements
      - 30 Instagram posts with strong visuals
      - Platform-native formatting and hashtags
      - Consistent brand voice across platforms
    agents: ["content-agent", "social-agent"]
    dependencies: ["Content Calendar Creation"]

  - name: "Community Engagement Strategy"
    instructions: |
      Develop engagement and community building approach:
      1. Identify key industry hashtags and conversations
      2. Find relevant groups and communities to join
      3. Create engagement templates for common interactions
      4. Plan influencer outreach and collaboration
      5. Set up social listening for brand mentions
    acceptance_criteria: |
      - 20-30 relevant hashtags per platform
      - 5-10 communities to actively participate in
      - Engagement templates for common scenarios
      - Influencer outreach list (10-15 contacts)
      - Social listening alerts configured
    agents: ["social-agent", "research-agent"]
    dependencies: ["Platform-Specific Content Creation"]

  - name: "Performance Tracking & Optimization"
    instructions: |
      Set up comprehensive analytics and optimization:
      1. Configure tracking for all social platforms
      2. Set up UTM parameters for social traffic
      3. Create weekly performance reports
      4. Identify top-performing content types
      5. Plan A/B testing for posting times and formats
    acceptance_criteria: |
      - Analytics tracking confirmed for all platforms
      - UTM parameter system implemented
      - Automated weekly reporting setup
      - Performance benchmarks established
      - A/B testing plan for next 30 days
    agents: ["analytics-agent", "social-agent"]
    dependencies: ["Community Engagement Strategy"]
```

## Client Onboarding Workflows

### 4. New Client Brand Analysis & Setup

**Use Case:** Systematically analyze and set up new client accounts

```yaml
name: "New Client Brand Analysis & Setup"
description: "Comprehensive client onboarding and brand analysis workflow"
category: "client-management"

steps:
  - name: "Brand Audit & Analysis"
    instructions: |
      Conduct comprehensive brand audit:
      1. Analyze existing brand materials and guidelines
      2. Review current marketing channels and performance
      3. Identify brand voice and messaging patterns
      4. Assess competitive positioning
      5. Document gaps and opportunities
    acceptance_criteria: |
      - Complete brand materials inventory
      - Current marketing performance baseline
      - Brand voice analysis and documentation
      - Competitive landscape map
      - Gap analysis with recommendations
    agents: ["research-agent", "brand-agent"]
    tools: ["web-search", "analytics-tools"]

  - name: "Brand Bible Creation"
    instructions: |
      Develop comprehensive brand bible:
      1. Document brand positioning and value proposition
      2. Define target audience personas (2-3 primary)
      3. Establish voice and tone guidelines
      4. Create content pillars and themes
      5. Set key performance indicators and goals
    acceptance_criteria: |
      - Complete brand positioning statement
      - 2-3 detailed buyer personas
      - Voice and tone guide with examples
      - 5-7 content pillars defined
      - SMART goals for next 90 days
    agents: ["brand-agent", "strategy-agent"]
    dependencies: ["Brand Audit & Analysis"]

  - name: "Competitive Intelligence Setup"
    instructions: |
      Establish ongoing competitive monitoring:
      1. Identify 5-10 direct and indirect competitors
      2. Set up social media monitoring for competitors
      3. Create competitive content analysis framework
      4. Establish pricing and positioning benchmarks
      5. Schedule monthly competitive reviews
    acceptance_criteria: |
      - Competitor matrix with 5-10 companies
      - Social monitoring alerts configured
      - Content analysis template created
      - Pricing/positioning benchmarks documented
      - Monthly review calendar scheduled
    agents: ["research-agent", "competitive-agent"]
    dependencies: ["Brand Bible Creation"]

  - name: "Marketing Technology Audit"
    instructions: |
      Assess and optimize client's marketing stack:
      1. Inventory all current marketing tools and platforms
      2. Evaluate integration opportunities and gaps
      3. Recommend technology optimizations
      4. Plan migration and setup priorities
      5. Create training materials for new tools
    acceptance_criteria: |
      - Complete martech stack inventory
      - Integration assessment report
      - Technology optimization recommendations
      - Implementation priority matrix
      - Training materials for new tools
    agents: ["tech-agent", "integration-agent"]
    dependencies: ["Competitive Intelligence Setup"]

  - name: "30-60-90 Day Marketing Plan"
    instructions: |
      Create detailed short-term marketing plan:
      1. Define 30-day quick wins and foundational work
      2. Plan 60-day campaign launches and optimizations
      3. Set 90-day strategic initiatives and expansions
      4. Assign responsibilities and timelines
      5. Create tracking and reporting schedule
    acceptance_criteria: |
      - Detailed 30-60-90 day action plan
      - Quick wins identified for immediate impact
      - Campaign calendar for 90 days
      - Clear responsibilities and deadlines
      - KPI tracking and reporting schedule
    agents: ["strategy-agent", "project-agent"]
    dependencies: ["Marketing Technology Audit"]
```

## Analytics & Optimization Workflows

### 5. Monthly Performance Review & Optimization

**Use Case:** Systematic monthly analysis and optimization of all marketing efforts

```yaml
name: "Monthly Performance Review & Optimization"
description: "Comprehensive monthly marketing performance analysis and optimization"
category: "analytics"

steps:
  - name: "Data Collection & Aggregation"
    instructions: |
      Gather performance data from all marketing channels:
      1. Collect website analytics (traffic, conversions, behavior)
      2. Gather social media metrics (reach, engagement, growth)
      3. Compile email marketing performance (open, click, conversion rates)
      4. Analyze paid advertising results (ROAS, CPC, CTR)
      5. Review sales funnel and conversion data
    acceptance_criteria: |
      - Complete website analytics summary
      - Social media performance dashboard
      - Email marketing metrics compilation
      - Paid advertising performance review
      - Sales funnel conversion analysis
    agents: ["analytics-agent", "data-agent"]
    tools: ["analytics-platforms", "social-analytics", "email-platforms"]

  - name: "Performance Analysis & Insights"
    instructions: |
      Analyze data for trends, patterns, and insights:
      1. Identify top-performing content and campaigns
      2. Analyze audience behavior and engagement patterns
      3. Compare performance to previous months and goals
      4. Identify underperforming areas and potential causes
      5. Spot emerging trends and opportunities
    acceptance_criteria: |
      - Top performers identified with success factors
      - Audience behavior insights documented
      - Month-over-month and goal comparison
      - Underperformance analysis with root causes
      - Trend and opportunity identification
    agents: ["analytics-agent", "insights-agent"]
    dependencies: ["Data Collection & Aggregation"]

  - name: "Competitive Benchmarking"
    instructions: |
      Compare performance against competitors:
      1. Analyze competitor social media growth and engagement
      2. Review competitor content performance and strategies
      3. Assess competitor advertising spend and approaches
      4. Benchmark website traffic and SEO performance
      5. Identify competitive advantages and gaps
    acceptance_criteria: |
      - Competitor performance comparison dashboard
      - Content strategy gap analysis
      - Advertising benchmark analysis
      - SEO competitive positioning review
      - Competitive advantage/gap summary
    agents: ["competitive-agent", "research-agent"]
    dependencies: ["Performance Analysis & Insights"]

  - name: "Optimization Recommendations"
    instructions: |
      Develop specific optimization recommendations:
      1. Prioritize improvements based on impact potential
      2. Create detailed action plans for each recommendation
      3. Estimate resource requirements and timelines
      4. Develop A/B testing plans for major changes
      5. Set success metrics for each optimization
    acceptance_criteria: |
      - Prioritized list of 5-10 optimization opportunities
      - Detailed action plans with steps and timelines
      - Resource requirement estimates
      - A/B testing protocols for major changes
      - Success metrics defined for each recommendation
    agents: ["optimization-agent", "strategy-agent"]
    dependencies: ["Competitive Benchmarking"]

  - name: "Report Generation & Presentation"
    instructions: |
      Create comprehensive performance report:
      1. Design executive summary with key insights
      2. Create detailed performance dashboards
      3. Include competitive analysis summary
      4. Present optimization recommendations with business impact
      5. Prepare client presentation materials
    acceptance_criteria: |
      - Executive summary (1-2 pages)
      - Detailed performance dashboard
      - Competitive analysis section
      - Optimization recommendations with ROI projections
      - Client presentation deck (10-15 slides)
    agents: ["reporting-agent", "presentation-agent"]
    dependencies: ["Optimization Recommendations"]
```

## How to Use These Workflows

### 1. Customization
- Copy any workflow and modify steps for your specific needs
- Adjust agent assignments based on your available specialists
- Modify acceptance criteria to match your quality standards

### 2. Client Adaptation
- Update brand bible references for each client
- Adjust timelines based on client requirements
- Customize KPIs and success metrics

### 3. Scaling
- Start with simple workflows and add complexity gradually
- Create template variations for different client types
- Build a library of reusable workflow components

### 4. Optimization
- Track workflow performance and execution time
- Iterate on acceptance criteria based on results
- Add or remove steps based on effectiveness

---

*Ready to create your own workflows? Check out the [Workflows Guide](../workflows-guide.md) for detailed instructions.*
