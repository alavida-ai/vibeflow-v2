# Glossary

This glossary explains key terms and concepts in Vibeflow using marketing language rather than technical jargon.

## A

### A2A (Agent-to-Agent Communication)
How specialized AI agents share information and coordinate work without your direct involvement. For example, when the Research Agent automatically passes findings to the Content Agent for blog post creation.

### Acceptance Criteria
Specific, measurable standards that define when a workflow step is complete. Think of these as your quality checklist - what must be true for work to be considered "done."

**Example:** "Blog post is 1500-2500 words, includes 3 internal links, has SEO title under 60 characters, and aligns with brand voice guidelines."

### Agent
A specialized AI team member with specific tools and expertise. Like hiring a specialist for particular marketing functions - a Research Agent for market analysis, Content Agent for writing, Social Agent for platform management.

### AI Project Manager
See **Cursor Agent**.

## B

### Brand Bible
Your collection of strategy documents that serve as the single source of truth for all brand decisions. Located in the `strategy/` folder, these markdown files guide every AI decision and content creation.

**Contains:** Brand positioning, target audience, voice guidelines, content pillars, competitive landscape.

## C

### Client Directory
A separate Vibeflow instance for each client, containing their unique brand bible, workflows, and outputs. Ensures complete isolation between client projects.

**Structure Example:**
```
your-agency/
├── client-a/
├── client-b/
└── client-c/
```

### Content Architect
See **Marketing Architect**.

### Content Engineer
The technical team member who builds and maintains the Vibeflow platform. Responsible for creating new agents, adding tools, and building integrations. You typically don't need to interact with them directly.

### Content Pillars
The main topics and themes your brand consistently addresses. Usually 3-5 core subjects that align with your expertise and audience interests.

**Example:** For a B2B SaaS agency: "Growth Marketing," "Marketing Operations," "Data & Analytics."

### Cursor Agent
The AI project manager that orchestrates your entire marketing operation. Acts as the bridge between you, your brand strategy, and specialist agents. Always consults your brand bible before making decisions.

**Key behaviors:**
- Never acts without brand context
- Asks questions instead of guessing
- Coordinates specialist agents
- Maintains quality control

## D

### Dependencies
Workflow steps that must be completed before others can begin. Like a project timeline - you can't write a blog post before completing the research step.

**Example:** "Content Creation" depends on "Topic Research & Validation"

## E

### Execution
When workflows run and agents perform their assigned tasks. During execution, the AI project manager coordinates everything while you provide guidance and approval.

## F

### Feedback Loop
The process of reviewing AI outputs, providing specific feedback, and iterating until acceptance criteria are met. Essential for maintaining quality and brand alignment.

**Best practice:** Be specific ("too casual for our B2B audience") rather than vague ("make it better").

## I

### Instructions
Detailed directions you provide to the AI project manager for each workflow step. Should be clear, specific, and include quality standards.

**Good instructions:** Numbered lists, specific deliverables, brand requirements
**Poor instructions:** Vague goals, unclear standards, missing context

## M

### Marketing Architect
Your role in the Vibeflow system. You define strategy, create workflows, manage client relationships, and maintain quality control. You focus on "what" and "why" while AI handles "how."

**Your responsibilities:**
- Strategic direction and brand bible maintenance
- Workflow design and quality control
- Client management and communication
- Review and approval of AI outputs

### MCP (Model Context Protocol)
The technical system that allows AI agents to access tools and services. For you, this means agents can connect to your marketing platforms (social media, email, analytics) seamlessly.

**What this means:** More integrations available with less technical complexity.

## P

### Parallel Execution
Running multiple workflow steps simultaneously instead of one after another. Saves time when steps don't depend on each other.

**Example:** While the Content Agent writes a blog post, the Social Agent can simultaneously create social media adaptations.

### Persona
Detailed profile of your target audience members, including demographics, psychographics, content preferences, and buying journey. Essential for AI agents to create relevant, engaging content.

**Should include:** Job title, company size, challenges, goals, information sources, decision-making style.

## Q

### Quality Gate
A checkpoint in your workflow where human review and approval are required before proceeding. Ensures brand standards and quality control.

**Example:** Content must be reviewed by Marketing Architect before publication.

## S

### Strategy Folder
The `strategy/` directory containing your brand bible documents. Every AI decision references these files to ensure brand alignment.

**Critical files:**
- brand-positioning.md
- target-audience.md  
- voice-messaging.md
- content-pillars.md

### Success Metrics
Quantifiable measures that define workflow effectiveness. Help you track performance and optimize processes over time.

**Examples:** Blog traffic, lead generation, engagement rates, campaign ROI.

## T

### Tools
Software and services that agents use to complete their work. Examples include web search, social media platforms, analytics tools, email systems.

**Agent access:** Each agent has specific tools based on their function - Research Agents get search tools, Social Agents get platform access.

### Target Audience
The specific group of people your marketing is designed to reach. Defined in your brand bible and used by AI agents to create relevant content.

**Should be specific:** "B2B SaaS marketing directors at 50-200 person companies" not "business people."

## V

### Version Control
System for tracking changes to your strategy documents and workflows. Allows you to safely experiment and revert if needed.

**Benefits:** Rollback capability, change tracking, safe experimentation.

### Voice Guidelines
Documentation of how your brand communicates, including tone, style, language preferences, and messaging themes. Critical for ensuring AI-generated content sounds authentically "you."

**Includes:** Voice attributes, tone variations, preferred language, words to avoid.

## W

### Workflow
A step-by-step marketing process broken down into clear instructions that AI can execute consistently. Your marketing playbooks translated into actionable automation.

**Components:**
- Name and description
- Sequential steps with instructions
- Acceptance criteria for each step
- Agent assignments
- Quality standards

### Workflow Categories
Organization system for grouping similar workflows:
- **content-marketing**: Blog posts, lead magnets, case studies
- **social-media**: Campaigns, community building
- **email-marketing**: Campaigns, automation, newsletters
- **analytics**: Reporting, analysis, optimization
- **client-management**: Onboarding, reporting

### Workflow Execution
The process of running a workflow from start to finish, with the AI project manager coordinating specialist agents while you provide guidance and approval.

**Your role during execution:**
- Provide context and requirements
- Review outputs against acceptance criteria
- Give specific feedback for improvements
- Approve work before moving to next step

## Y

### YAML
The file format used for workflow definitions. Don't worry - you don't need to be technical. YAML is just a structured way to write instructions that's easy for both humans and AI to read.

**Example structure:**
```yaml
name: "Workflow Name"
description: "What this accomplishes"
steps:
  - name: "Step 1"
    instructions: "What to do"
    acceptance_criteria: "How to know it's done"
```

---

## Quick Reference: Key Concepts

### The Big Picture
1. **You** (Marketing Architect) define strategy and workflows
2. **Brand Bible** provides strategic foundation for all decisions
3. **Cursor Agent** (AI Project Manager) orchestrates everything
4. **Specialist Agents** execute specific marketing tasks
5. **Workflows** break complex goals into manageable steps

### Your Daily Workflow
1. Define what you want to accomplish
2. Choose or create appropriate workflow
3. Provide context and requirements
4. Review AI outputs against your standards
5. Provide feedback and approve work
6. Monitor results and optimize

### Success Factors
- **Clear Brand Bible**: Well-documented strategy guides all decisions
- **Specific Instructions**: Detailed acceptance criteria ensure quality
- **Regular Feedback**: Continuous improvement through iteration
- **Brand Consistency**: Every output aligns with your strategic foundation

---

*Questions about any of these terms? Check the [troubleshooting guide](./troubleshooting.md) or refer back to the specific concept guides.*
