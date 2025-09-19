# Getting Started with Vibeflow

Welcome to Vibeflow! This guide will get you from zero to running your first marketing workflow in minutes.

## What You'll Learn

- How to set up a Vibeflow instance for your agency
- The three core concepts: Brand Bible, Workflows, and Agents
- How to structure client projects
- Your first workflow execution

## Start Here: The Big Picture

Before diving into setup details, **[see the complete three-tier system overview](./diagrams/three-tier-system.md)** to understand how you fit into the Vibeflow ecosystem and the value you provide to your clients.

## Installation

Setting up Vibeflow is as simple as creating any modern web application:

```bash
npx create-vibeflow-app@latest my-agency-name
cd my-agency-name
```

This creates a complete Vibeflow workspace with:
- ✅ Pre-configured agent ecosystem
- ✅ Sample workflows and agents
- ✅ Brand bible template
- ✅ Development environment ready

## Understanding Your Vibeflow Workspace

After installation, you'll see this structure:

```
my-agency-name/
├── strategy/              # Your Brand Bible
│   ├── brand-positioning.md
│   ├── target-audience.md
│   ├── voice-messaging.md
│   └── content-pillars.md
├── workflows/             # Marketing automation workflows
│   ├── content-creation.yaml
│   └── social-campaign.yaml
├── agents/               # Specialized AI agents
│   ├── copywriter.yaml
│   └── researcher.yaml
└── .cursor/              # AI assistant configuration
```

**🎯 New to Vibeflow?** Start with these visual guides:
- 📊 **[Three-Tier System Overview](./diagrams/three-tier-system.md)** - Understand your role in the system
- 🔄 **[How Workflows Execute](./diagrams/workflow-execution.md)** - See your YAML become AI magic

## Core Concepts

### 1. The Brand Bible (Your Strategic Foundation)

The `strategy/` folder contains markdown files that define your brand's voice, positioning, and approach. This is your **single source of truth** that guides every AI decision.

**Example: brand-positioning.md**
```markdown
# Brand Positioning

## Mission
We help B2B SaaS companies scale through authentic storytelling.

## Value Proposition
Transform complex technical features into compelling customer narratives.

## Tone of Voice
- Professional but approachable
- Data-driven yet human
- Confident without being arrogant
```

### 2. Workflows (Your Marketing Processes)

Workflows break down complex marketing goals into step-by-step instructions. Each step has:
- Clear instructions for the AI project manager
- Specific acceptance criteria
- References to required tools/agents

### 3. Agents (Your Specialized Team)

Agents are AI specialists with access to specific tools:
- **Research Agent**: Market analysis, competitor research, trend identification
- **Content Agent**: Writing, editing, SEO optimization
- **Analytics Agent**: Performance tracking, report generation
- **Social Agent**: Platform management, posting, engagement

## Client Project Structure

For agencies managing multiple clients, create separate Vibeflow instances:

```
your-agency/
├── client-a/
│   ├── strategy/
│   ├── workflows/
│   └── agents/
├── client-b/
│   ├── strategy/
│   ├── workflows/
│   └── agents/
└── your-agency/
    ├── strategy/
    ├── workflows/
    └── agents/
```

Each client gets their own:
- Brand bible tailored to their business
- Custom workflows for their goals
- Agent configurations for their needs

## Your First Workflow

Let's run a simple content creation workflow:

1. **Open your AI assistant** (Cursor)
2. **Navigate to your Vibeflow directory**
3. **Say**: "List available workflows"
4. **Choose**: "content-creation" workflow
5. **Follow the prompts** as the AI guides you through each step

The AI will:
- Consult your brand bible for context
- Coordinate with specialized agents
- Ask you questions when input is needed
- Present results that align with your brand

## What Happens Next?

The AI project manager will:
- Read your brand positioning and voice guidelines
- Delegate research tasks to the Research Agent
- Brief the Content Agent with brand-specific context
- Present you with brand-aligned content drafts
- Iterate based on your feedback

## Next Steps

Now that you understand the basics:

1. [**Learn about roles**](./roles-and-responsibilities.md) - Understand your role as Marketing Architect
2. [**Explore workflows**](./workflows-guide.md) - Create custom marketing processes
3. [**Check examples**](./examples/workflows.md) - See real-world implementations

## Common Questions

**Q: Do I need technical skills?**
A: No. You define strategy and workflows in plain English. The AI handles technical execution.

**Q: How do I customize agents?**
A: Content Engineers can add new tools and capabilities. As a Marketing Architect, you focus on directing their work.

**Q: Can I use this for multiple clients?**
A: Absolutely. Each client directory is completely isolated with their own brand bible and workflows.

**Q: What if the AI makes mistakes?**
A: You maintain control at every step. The AI asks for approval and incorporates your feedback continuously.

---

*Ready to dive deeper? Learn about [your role as Marketing Architect](./roles-and-responsibilities.md).*
