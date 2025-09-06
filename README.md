# Vibeflow
## Own Your Media Infrastructure. Scale Your Voice. Build Your Empire.

**Vibeflow is the Next.js for media creation** - a framework that lets you build your own AI-powered media company instead of depending on algorithms, subscriptions, and platform middlemen.

> **Stop renting attention. Start owning distribution.**

---

## 🎯 Why Vibeflow?

### The Problem: You Don't Own Your Audience
- **Twitter** can change the algorithm tomorrow and kill your reach
- **Newsletter platforms** charge monthly fees and own your subscriber relationships  
- **Content tools** cost $500+/month with zero ownership
- **Media companies** control your editorial freedom and revenue

### The Solution: Own Your Media Infrastructure
- **Build once, own forever** - no monthly subscription treadmill
- **Complete creative control** - no editorial oversight or platform rules
- **100% revenue retention** - no 30% platform taxes
- **AI-powered automation** - scale content creation without hiring
- **Multi-platform distribution** - publish everywhere from one system

**Real Example:** Instead of paying $6,000/year for marketing tools that you never own, build a $5,000 system once that saves you $20,000+ over 5 years.

---

## 🚀 What You'll Build

Vibeflow helps you create your own **AI-powered media empire**:

### For Technical Creators
- **Build-in-public automation** that documents your progress
- **Technical content scaling** from code to Twitter threads to newsletters
- **Community building** that turns followers into customers

### For Independent Journalists  
- **Investigation workflows** that monitor sources and trends
- **Multi-format publishing** from articles to social media to podcasts
- **Direct monetization** through owned subscriber relationships

### For Subject Matter Experts
- **Knowledge monetization** that turns expertise into recurring revenue
- **Audience development** that builds authority and trust
- **Content multiplication** that creates courses, newsletters, and speaking opportunities

### For Creative Professionals
- **Portfolio automation** that showcases your work across platforms
- **Client acquisition** that turns content into business development
- **Product sales** that diversifies income beyond client work

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- **Cursor IDE** (free download from [cursor.sh](https://cursor.sh))
- **Node.js 18+** (download from [nodejs.org](https://nodejs.org))
- **5 minutes** to answer some questions about your brand

### Step 1: Create Your Vibeflow Project
```bash
npx create-vibeflow-app my-media-company
cd my-media-company
```

### Step 2: Start Your Local Media Studio  
```bash
npm run dev
```

This launches your personal media infrastructure at `http://localhost:4111`

### Step 3: Let AI Build Your Brand Strategy
In Cursor, simply tell the AI agent:

> "Start the personal brand onboarding workflow"

The AI will interview you about:
- Your mission and unique positioning
- Your target audience and their needs  
- Your competitors and differentiators
- Your content strategy and voice
- Your distribution channels and goals

### Step 4: Get Your Professional Strategy
After 20-30 minutes of guided questions, you'll have:
- **Brand Fundamentals Document** - mission, vision, values, positioning
- **Market & Content Strategy** - competitor analysis, content pillars, channel plan
- **Tone of Voice Guide** - communication guidelines and examples

### Step 5: Configure Your API Keys
Set up the integrations that power your media infrastructure:

```bash
# Copy environment template
cp .env.example .env
```

See the [API Setup Guide](#🔑-api-setup-guide) below for detailed instructions on obtaining each API key.

### Step 6: Start Creating
Use your brand strategy to:
- Generate consistent content across all platforms
- Build automated workflows for research and publishing
- Scale your media operations without losing your voice

---

## 🛠️ How It Works

### 1. Strategic Intelligence Layer
Your `/strategy` folder contains your brand DNA:
- Brand fundamentals and voice consistency
- Audience analysis and competitive positioning  
- Content frameworks and performance optimization

### 2. Workflow Engine
Create YAML workflows that automate your media operations:
```yaml
id: daily-newsletter
description: Research, write, and distribute daily newsletter
steps:
  - id: trend-research
    description: AI monitors industry trends and news
  - id: content-creation  
    description: Generate newsletter using brand voice
  - id: multi-platform-distribution
    description: Publish to email, social, and website
```

### 3. AI Agent Orchestration
Your Cursor AI agent becomes your media team:
- **Research agents** monitor trends and competitors
- **Content agents** write in your unique voice
- **Distribution agents** publish across platforms
- **Analytics agents** optimize performance

### 4. Component Marketplace
Install proven workflows from successful creators:
```bash
vibeflow add workflow/technical-newsletter
vibeflow add framework/build-in-public-system
vibeflow add template/product-launch-campaign
```

---

## 📁 Project Structure

```
my-media-company/
├── strategy/
│   ├── brand-fundamentals.md      # Your brand DNA
│   ├── content-strategy.md        # Content plan and frameworks  
│   ├── tone-of-voice.md          # Communication guidelines
│   └── vibeflow-product-strategy.md # Complete vision document
├── studio/
│   ├── workflows/                 # Your automation workflows
│   ├── templates/                 # Content and strategy templates
│   └── components/               # Reusable marketing components
├── .cursor/
│   ├── mcp.json                  # AI agent configuration
│   └── rules/                    # AI behavior guidelines
└── package.json                  # Project dependencies
```

---

## 🎨 What Makes Vibeflow Different

### vs. Traditional Marketing Tools
| **Marketing SaaS** | **Vibeflow** |
|-------------------|--------------|
| $500/month forever | $5,000 once, own forever |
| Template limitations | Fully customizable |
| Platform dependency | Complete ownership |
| Generic AI | Your brand-trained AI |
| Fragmented tools | Unified system |

### vs. Creator Platforms  
| **Platform Dependence** | **Vibeflow Infrastructure** |
|-------------------------|----------------------------|
| Algorithm controls reach | You control distribution |
| 30% platform tax | 100% revenue retention |
| Platform owns audience | You own all relationships |
| Can be banned/deleted | Owned infrastructure |
| Limited monetization | Unlimited revenue streams |

### vs. Traditional Agencies
| **Hiring an Agency** | **Building with Vibeflow** |
|---------------------|---------------------------|
| $5K-20K/month ongoing | $5K one-time build cost |
| They own the strategy | You own everything |
| Limited to their tools | Any tool integration |
| Dependency relationship | Complete independence |
| Black box process | Full transparency |

---

## 🔑 API Setup Guide

Vibeflow integrates with powerful APIs to automate your media operations. Here's how to get each API key:

### Twitter API .io Setup

1. **Create Twitter API .io Account**
   - Go to [TwitterAPI.io](https://twitterapi.io/?ref=alexgirardet)
   - Sign up for an account
   - Choose a plan that fits your monitoring needs

2. **Generate API Key**
   - Navigate to your dashboard
   - Copy your **API Key** (this is your `TWITTER_API_KEY`)
   - No complex OAuth setup required!

3. **Why Twitter API .io?**
   - **Simplified Setup**: No complex OAuth or Twitter Developer approval needed
   - **Reliable Access**: Consistent data access without API v2 migration issues
   - **Better Rate Limits**: More predictable and generous rate limiting
   - **Real-time Data**: Direct access to mentions and search results
   - **Cost-Effective**: More affordable than Twitter's enterprise pricing


### OpenAI API Setup

1. **Create OpenAI Account**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign up or log in to your account
   - Add billing information to access the API

2. **Generate API Key**
   - Navigate to [API Keys section](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (this is your `OPENAI_API_KEY`)
   - Store it securely - you won't be able to see it again

### OpenRouter API Setup

1. **Create OpenRouter Account**
   - Go to [openrouter.ai](https://openrouter.ai)
   - Sign up for an account
   - Add credits to your account for API usage

2. **Generate API Key**
   - Navigate to your [API Keys page](https://openrouter.ai/keys)
   - Click "Create Key"
   - Copy the key (this is your `OPENROUTER_API_KEY`)

### Firecrawl API Setup

1. **Create Firecrawl Account**
   - Go to [firecrawl.dev](https://firecrawl.dev)
   - Sign up for an account
   - Choose a plan based on your web scraping needs

2. **Get API Key**
   - Navigate to your dashboard
   - Copy your API key (this is your `FIRECRAWL_API_KEY`)

### Database Setup

For your `DATABASE_URL`, you have several options:

**Option 1: SQLite (Local Development)**
```bash
DATABASE_URL=sqlite://./data.db
```

**Option 2: PostgreSQL (Production)**
```bash
# Local PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Cloud providers (Supabase, Neon, Railway)
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

---

## 🌟 Success Stories

> *"Replaced 12 marketing subscriptions with one Vibeflow system. Saved $18,000/year and gained complete control over my content strategy."*
> — **Technical Founder, SaaS Startup**

> *"Built a newsletter audience of 50,000 subscribers using automated research and content workflows. Revenue increased 300% in 6 months."*  
> — **Independent Journalist**

> *"Scaled from posting once a week to daily content across 5 platforms without increasing time investment."*
> — **Design Agency Owner**

---

## 🎓 Learning Path

### New to Media Strategy?
1. **Start with onboarding workflow** - builds complete brand strategy
2. **Use provided templates** - proven frameworks for content creation
3. **Join the community** - learn from other Vibeflow creators
4. **Iterate and optimize** - improve based on performance data

### Experienced Creator?
1. **Import existing brand assets** into strategy folder
2. **Build custom workflows** for your specific use cases  
3. **Integrate your current tools** via APIs and automation
4. **Share successful patterns** with the community

### Technical Background?
1. **Explore the codebase** - contribute to open source development
2. **Build custom components** - extend Vibeflow capabilities
3. **Create integrations** - connect to new platforms and tools
4. **Lead community development** - help define the future of media infrastructure

---

## 🤝 Community & Support

### Get Help
- **Discord Community** - Connect with other Vibeflow creators
- **Documentation** - Comprehensive guides and tutorials
- **GitHub Issues** - Report bugs and request features
- **Office Hours** - Weekly community calls and Q&A

### Contribute
- **Share workflows** - Upload successful patterns to component marketplace
- **Improve documentation** - Help make Vibeflow more accessible
- **Build integrations** - Connect new platforms and tools
- **Spread the word** - Help creators discover owned media infrastructure

### Stay Updated
- **Newsletter** - Weekly updates on new features and community highlights
- **Twitter** - Follow [@vibeflow](https://twitter.com/vibeflow) for daily insights
- **Blog** - Deep dives on media infrastructure and creator economy trends

---

## 🔮 Vision: The Future of Media

**By 2030, every creator will own their media infrastructure just like developers own their code infrastructure.**

This means:
- **Journalists** investigate and publish without editorial constraints
- **Builders** scale content creation alongside product development
- **Experts** monetize knowledge through direct audience relationships  
- **Creators** build media empires without platform dependency

**The result:** A media landscape where the best ideas win based on merit and audience value, not algorithmic manipulation or institutional gatekeeping.

---

## 📄 License

Vibeflow is open source and available under the MIT License. Build, modify, and distribute freely.

---

## 🚀 Ready to Own Your Media Infrastructure?

```bash
# Start building your media empire today
npx create-vibeflow-app my-media-company
cd my-media-company  
npm run dev

# Then tell your Cursor agent:
# "Start the personal brand onboarding workflow"
```

**Questions?** Join our [Discord community](https://discord.gg/vibeflow) or [book a demo call](https://cal.com/vibeflow).

**Want to contribute?** Check out our [contribution guidelines](CONTRIBUTING.md) and help build the future of creator-owned media.

---

*"Own your distribution. Scale your voice. Build your empire."*

**[Get Started](https://github.com/vibeflow/vibeflow) • [Community](https://discord.gg/vibeflow) • [Documentation](https://docs.vibeflow.dev) • [Examples](https://github.com/vibeflow/examples)**

