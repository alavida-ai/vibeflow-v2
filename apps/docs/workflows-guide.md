# Workflows Guide

Workflows are the heart of Vibeflow automation. They transform your marketing processes into step-by-step instructions that AI can execute consistently while maintaining your brand standards.

## Understanding Workflows

### What Are Workflows?

Think of workflows as **marketing playbooks** - documented processes that break down complex marketing goals into manageable steps. Each workflow defines:

- **What needs to be done** (clear instructions)
- **How success is measured** (acceptance criteria)
- **Who should do it** (which agents to use)
- **When it's complete** (quality standards)

### Why Workflows Matter

**Without workflows:**
- Inconsistent execution across campaigns
- Hard to scale successful processes
- Difficult to train new team members
- No clear quality standards

**With workflows:**
- **Repeatable Success**: Proven processes you can run again and again
- **Quality Control**: Built-in standards ensure consistent outputs
- **Scalability**: Easy to onboard new clients with established processes
- **Continuous Improvement**: Track and optimize what works

## Workflow Structure

### Basic Components

Every Vibeflow workflow contains these elements:

```yaml
name: "Descriptive Workflow Name"
description: "Brief explanation of what this workflow accomplishes"
category: "content-marketing" # or "social-media", "analytics", etc.

steps:
  - name: "Step Name"
    instructions: "Detailed instructions for the AI project manager"
    acceptance_criteria: "How to know if this step is complete"
    agents: ["agent-name"] # Which specialists to use
    tools: ["tool-name"] # Optional: specific tools required
    dependencies: ["Previous Step Name"] # Optional: step order
```

### Step-by-Step Breakdown

#### 1. Name and Description
- **Name**: Clear, action-oriented title
- **Description**: One sentence explaining the workflow's purpose
- **Category**: Helps organize and find workflows

```yaml
name: "Blog Post Creation & SEO Optimization"
description: "Research, write, and optimize blog posts for search engines and brand alignment"
category: "content-marketing"
```

#### 2. Instructions
Clear, detailed directions for the AI project manager. Include:
- Specific tasks to complete
- Quality standards to maintain
- Brand guidelines to follow
- Output format requirements

```yaml
instructions: |
  Research the given topic and create an SEO-optimized blog post:
  1. Conduct keyword research and competitive analysis
  2. Create a detailed outline addressing user intent
  3. Write 1500-2500 words following brand voice guidelines
  4. Include 2-3 internal links and 2-3 external authority links
  5. Optimize meta description and title tag
  6. Ensure content provides actionable value to readers
```

#### 3. Acceptance Criteria
Specific, measurable standards that define completion:
- Quantifiable metrics (word count, number of links, etc.)
- Quality standards (readability scores, brand alignment)
- Deliverable requirements (formats, components)

```yaml
acceptance_criteria: |
  - 1500-2500 word count achieved
  - Flesch Reading Ease score of 60 or higher
  - 2-3 internal links to relevant existing content
  - 2-3 external links to authoritative sources
  - Meta description under 160 characters
  - Title tag under 60 characters
  - Content aligns with brand voice guidelines
  - At least one clear call-to-action included
```

#### 4. Agent Assignment
Specify which specialized agents should handle this step:

```yaml
agents: ["research-agent", "content-agent"] # Multiple agents can collaborate
# or
agents: ["content-agent"] # Single agent for focused tasks
```

#### 5. Dependencies (Optional)
Control the order of steps when sequence matters:

```yaml
dependencies: ["Research & Keyword Analysis"] # This step must complete first
```

## Creating Your First Workflow

### Step 1: Define the Goal

Start with a clear marketing goal. Ask yourself:
- What specific outcome do I want?
- How will I measure success?
- Who is the target audience?
- What assets will be created?

**Example Goal:** "Create a lead magnet that generates 100+ qualified leads per month from our target audience of B2B SaaS marketing directors."

### Step 2: Break Down the Process

List every step required to achieve your goal:

1. Research audience pain points
2. Develop lead magnet concept
3. Create the content
4. Design the landing page
5. Set up email automation
6. Launch and promote
7. Track and optimize

### Step 3: Define Each Step

For each step, specify:

```yaml
- name: "Audience Pain Point Research"
  instructions: |
    Research the specific challenges faced by B2B SaaS marketing directors:
    1. Analyze customer support tickets for common questions
    2. Survey existing customers about their biggest challenges
    3. Research competitor lead magnets and identify gaps
    4. Review industry forums and LinkedIn discussions
    5. Validate pain points against our solution capabilities
  acceptance_criteria: |
    - 5-7 validated pain points with supporting evidence
    - Competitive gap analysis with 3-5 competitor examples
    - Pain point ranking by frequency and urgency
    - Clear connection between pain points and our solutions
  agents: ["research-agent"]
  tools: ["web-search", "survey-tools", "social-listening"]
```

### Step 4: Test and Refine

Run your workflow and gather feedback:
- Did each step produce the expected output?
- Were the instructions clear enough?
- Did the acceptance criteria accurately measure success?
- Which steps took longer than expected?

## Workflow Types and Templates

### Content Marketing Workflows

#### Blog Content Creation
**Use case:** Consistent, SEO-optimized blog content
**Frequency:** Weekly or bi-weekly
**Key steps:** Research → Outline → Writing → Optimization → Promotion

#### Lead Magnet Development
**Use case:** High-converting lead generation assets
**Frequency:** Monthly or quarterly
**Key steps:** Research → Concept → Creation → Landing Page → Automation

#### Content Repurposing
**Use case:** Maximize value from existing content
**Frequency:** Weekly
**Key steps:** Audit → Adapt → Optimize → Distribute → Track

### Social Media Workflows

#### Multi-Platform Campaign
**Use case:** Coordinated social media campaigns
**Frequency:** Campaign-based
**Key steps:** Strategy → Calendar → Creation → Scheduling → Engagement

#### Community Building
**Use case:** Grow and engage social media communities
**Frequency:** Daily/Weekly
**Key steps:** Listen → Engage → Create → Share → Analyze

### Client Management Workflows

#### New Client Onboarding
**Use case:** Systematic client setup and brand analysis
**Frequency:** Per new client
**Key steps:** Audit → Strategy → Setup → Training → Launch

#### Monthly Client Reporting
**Use case:** Consistent performance reporting
**Frequency:** Monthly
**Key steps:** Data Collection → Analysis → Insights → Recommendations → Presentation

## Advanced Workflow Features

### Conditional Logic

Add decision points to your workflows:

```yaml
- name: "Performance Review"
  instructions: |
    Review the content performance and decide next steps:
    - If engagement rate > 5%: Proceed to promotion amplification
    - If engagement rate < 5%: Return to content optimization
    - If technical issues found: Escalate to technical team
  acceptance_criteria: |
    - Performance metrics analyzed and documented
    - Clear decision made based on defined thresholds
    - Next steps clearly defined and communicated
  agents: ["analytics-agent"]
```

### Parallel Execution

Run multiple steps simultaneously:

```yaml
- name: "Content Creation"
  parallel_steps:
    - name: "Blog Post Writing"
      agents: ["content-agent"]
    - name: "Social Media Adaptation"
      agents: ["social-agent"]
    - name: "Email Newsletter Version"
      agents: ["email-agent"]
```

### Quality Gates

Add review checkpoints:

```yaml
- name: "Content Review Gate"
  type: "review"
  instructions: |
    Review all content before proceeding:
    1. Check brand voice alignment
    2. Verify factual accuracy
    3. Confirm SEO optimization
    4. Approve for publication
  approval_required: true
  reviewers: ["marketing-architect"]
```

## Workflow Management Best Practices

### 1. Start Simple, Add Complexity

**Begin with basic workflows:**
```yaml
name: "Simple Blog Post"
steps:
  - name: "Research"
  - name: "Write"
  - name: "Review"
  - name: "Publish"
```

**Evolve to comprehensive workflows:**
```yaml
name: "Advanced Blog Post with Distribution"
steps:
  - name: "Keyword Research"
  - name: "Competitive Analysis"
  - name: "Content Outline"
  - name: "Draft Writing"
  - name: "SEO Optimization"
  - name: "Internal Review"
  - name: "Social Media Adaptation"
  - name: "Email Newsletter Integration"
  - name: "Performance Tracking Setup"
```

### 2. Use Clear Naming Conventions

**Good naming:**
- "Blog Post Creation & SEO Optimization"
- "Monthly Client Performance Review"
- "New Client Onboarding & Setup"

**Avoid vague naming:**
- "Content Workflow"
- "Marketing Process"
- "Client Stuff"

### 3. Document Assumptions

Include context that agents need to know:

```yaml
context: |
  This workflow assumes:
  - Target audience is B2B SaaS marketing directors
  - Blog posts should be 1500-2500 words
  - SEO optimization includes keyword research and meta tags
  - Brand voice guidelines are available in strategy/voice-messaging.md
```

### 4. Plan for Iterations

Build feedback loops into your workflows:

```yaml
- name: "Content Optimization"
  instructions: |
    If initial content doesn't meet acceptance criteria:
    1. Identify specific areas for improvement
    2. Provide detailed feedback to content agent
    3. Request revisions with specific guidance
    4. Review revised content against original criteria
  max_iterations: 3
```

### 5. Track Performance Metrics

Include measurement in your workflows:

```yaml
- name: "Performance Tracking Setup"
  instructions: |
    Set up comprehensive tracking for this campaign:
    1. Create UTM parameters for all links
    2. Set up Google Analytics goals
    3. Configure social media tracking
    4. Schedule 30-day performance review
  acceptance_criteria: |
    - All tracking parameters configured
    - Baseline metrics documented
    - Success metrics defined and agreed upon
    - Follow-up review scheduled
```

## Collaborating with the AI Project Manager

### How to Start a Workflow

1. **Open your AI assistant** (Cursor)
2. **Navigate to your Vibeflow directory**
3. **Say**: "List available workflows"
4. **Choose**: The workflow you want to run
5. **Provide context**: Any specific requirements or constraints

### Providing Effective Feedback

When the AI presents results for review:

**Be specific:**
❌ "This doesn't feel right"
✅ "The tone is too casual for our enterprise audience. Please make it more professional while keeping it approachable."

**Reference your brand bible:**
❌ "Make it more on-brand"
✅ "This doesn't align with our brand voice guidelines in strategy/voice-messaging.md. Please review the 'professional but approachable' tone examples and revise."

**Provide examples:**
❌ "Make it better"
✅ "Here's an example of the style I'm looking for: [insert example]. Notice how it balances expertise with accessibility."

### Working Through Workflow Steps

The AI project manager will:
1. **Consult your brand bible** before starting each step
2. **Brief specialist agents** with comprehensive context
3. **Present results** for your review and approval
4. **Iterate based on feedback** until acceptance criteria are met
5. **Move to the next step** once you approve the current work

## Troubleshooting Common Issues

### Problem: Steps Take Too Long

**Solutions:**
- Break large steps into smaller, focused tasks
- Clarify acceptance criteria to avoid over-delivery
- Specify time limits for research and iterations

### Problem: Outputs Don't Meet Standards

**Solutions:**
- Review and strengthen your brand bible
- Add more specific examples to acceptance criteria
- Include quality checklist in instructions

### Problem: Agents Misunderstand Instructions

**Solutions:**
- Use numbered lists for complex instructions
- Include "what NOT to do" examples
- Add context about target audience and goals

### Problem: Workflow Gets Stuck

**Solutions:**
- Check for unclear acceptance criteria
- Ensure all required brand bible documents exist
- Verify agent assignments match required capabilities

## Workflow Library Organization

### Naming Structure
```
category-type-frequency-variation.yaml

Examples:
- content-blog-weekly-standard.yaml
- social-campaign-quarterly-product-launch.yaml
- client-onboarding-per-client-saas.yaml
```

### Categories
- **content-marketing**: Blog posts, lead magnets, case studies
- **social-media**: Campaigns, community building, influencer outreach
- **email-marketing**: Campaigns, automation, newsletters
- **analytics**: Reporting, optimization, analysis
- **client-management**: Onboarding, reporting, communication

### Version Control
- Keep old versions when making major changes
- Document what changed and why
- Test new versions alongside proven workflows

---

*Ready to create your first workflow? Start with the [sample workflows](./examples/workflows.md) and adapt them to your needs. Once you're comfortable with workflows, learn about [configuring agents](./agents-guide.md) to execute them effectively.*
