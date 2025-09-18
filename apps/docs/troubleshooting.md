# Troubleshooting Guide

This guide helps you solve common issues when using Vibeflow. Most problems stem from unclear instructions, incomplete brand bibles, or communication gaps between you and the AI agents.

## Quick Diagnosis

Before diving into specific solutions, identify your issue:

### 🚨 **Immediate Problems** (Something's broken)
- Workflows won't start
- Agents produce error messages
- System not responding to commands

### ⚠️ **Quality Issues** (Output isn't what you expected)
- Content doesn't match brand voice
- Work doesn't meet acceptance criteria
- Agents misunderstand instructions

### 📈 **Performance Issues** (Things are slow or inefficient)
- Workflows take too long
- Too many iterations needed
- Agents get stuck in loops

---

## Immediate Problems

### Workflow Won't Start

**Symptoms:**
- "List workflows" shows no results
- Error messages when trying to start workflows
- AI can't find workflow files

**Solutions:**

1. **Check your directory structure:**
   ```
   your-project/
   ├── workflows/
   │   ├── workflow1.yaml
   │   └── workflow2.yaml
   └── strategy/
       ├── brand-positioning.md
       └── voice-messaging.md
   ```

2. **Verify workflow file format:**
   - Files must end in `.yaml` or `.yml`
   - Check for syntax errors (proper indentation, quotes)
   - Ensure required fields are present (name, description, steps)

3. **Restart your AI assistant:**
   - Close and reopen Cursor
   - Navigate back to your project directory
   - Try listing workflows again

**Prevention:**
- Use workflow templates from the [examples](./examples/workflows.md)
- Test new workflows with simple steps first
- Keep backup copies of working workflows

### Agents Produce Error Messages

**Symptoms:**
- "Agent not found" errors
- "Tool access denied" messages
- "Invalid instruction format" warnings

**Solutions:**

1. **Check agent names in workflows:**
   ```yaml
   # Correct
   agents: ["research-agent", "content-agent"]
   
   # Incorrect
   agents: ["researcher", "writer"]
   ```

2. **Verify tool availability:**
   - Some agents may not have access to certain tools
   - Check agent configurations for available tools
   - Request tool additions from Content Engineers if needed

3. **Review instruction format:**
   ```yaml
   # Good instructions
   instructions: |
     Research the topic and create content:
     1. Conduct keyword research
     2. Write 1500-word article
     3. Include 3 internal links
   
   # Poor instructions
   instructions: "Make some content about the topic"
   ```

**Prevention:**
- Use established agent names from [sample configurations](./examples/agents.md)
- Test workflows with single agents first
- Keep instructions specific and actionable

### System Not Responding

**Symptoms:**
- Commands don't execute
- No responses from AI assistant
- Interface seems frozen

**Solutions:**

1. **Check your environment:**
   - Ensure you're in the correct project directory
   - Verify Vibeflow installation is complete
   - Check internet connection for AI services

2. **Restart and retry:**
   - Close all applications
   - Restart Cursor/AI assistant
   - Navigate to project directory
   - Try a simple command like "list workflows"

3. **Verify installation:**
   ```bash
   # Check if Vibeflow is properly installed
   npx create-vibeflow-app@latest --version
   ```

**Prevention:**
- Keep your AI assistant updated
- Don't modify core Vibeflow files
- Maintain good file organization

---

## Quality Issues

### Content Doesn't Match Brand Voice

**Symptoms:**
- AI content sounds generic or off-brand
- Tone doesn't match your guidelines
- Terminology doesn't align with your industry

**Root Causes:**
- Incomplete or unclear brand bible
- Agents not referencing strategy documents
- Missing voice guidelines or examples

**Solutions:**

1. **Strengthen your brand bible:**
   ```markdown
   # In voice-messaging.md
   
   ## Voice Attributes
   - Professional but approachable
   - Data-driven yet empathetic
   - Confident without being arrogant
   
   ## Good Examples
   "Our data shows that 73% of B2B buyers prefer vendors who understand their challenges rather than those who simply pitch features."
   
   ## Poor Examples
   "We're the best! Our amazing solution will revolutionize your business!"
   ```

2. **Add specific instructions to workflows:**
   ```yaml
   instructions: |
     Create content following these brand guidelines:
     1. Review strategy/voice-messaging.md for tone examples
     2. Use "data-driven yet empathetic" approach
     3. Include specific statistics and insights
     4. Avoid buzzwords like "revolutionary" or "game-changing"
     5. Write for B2B SaaS marketing directors, not general audience
   ```

3. **Provide better feedback:**
   ```
   ❌ "This doesn't sound like us"
   ✅ "This tone is too casual for our enterprise audience. Please review our voice guidelines in strategy/voice-messaging.md and make it more professional while keeping it approachable. See the example about data-driven empathy."
   ```

**Prevention:**
- Create detailed brand bible with examples
- Include voice check in acceptance criteria
- Provide specific feedback referencing brand documents

### Work Doesn't Meet Acceptance Criteria

**Symptoms:**
- Agents think work is complete, but it doesn't meet your standards
- Multiple iterations still don't hit the mark
- Quality is inconsistent across different agents

**Root Causes:**
- Vague or unmeasurable acceptance criteria
- Missing quality standards
- Conflicting instructions

**Solutions:**

1. **Make criteria specific and measurable:**
   ```yaml
   # Vague criteria
   acceptance_criteria: "Good blog post that people will like"
   
   # Specific criteria
   acceptance_criteria: |
     - 1500-2500 word count
     - Flesch Reading Ease score above 60
     - 3-5 internal links to relevant pages
     - 2-3 external links to authority sites
     - Meta description under 160 characters
     - At least one data point or statistic
     - Clear call-to-action in conclusion
     - Brand voice alignment confirmed
   ```

2. **Create quality checklists:**
   ```yaml
   instructions: |
     Before submitting work, verify:
     ✓ Content addresses target audience pain points
     ✓ Tone matches brand voice guidelines
     ✓ SEO elements are optimized
     ✓ Facts and statistics are accurate
     ✓ Call-to-action is clear and compelling
   ```

3. **Add examples to acceptance criteria:**
   ```yaml
   acceptance_criteria: |
     - Professional tone similar to this example: "Based on our analysis of 1,000+ B2B companies, we've identified three key factors that separate high-growth organizations from their peers."
     - Avoid overly casual language like: "Let's dive into some awesome strategies that'll totally transform your business!"
   ```

**Prevention:**
- Start with very specific acceptance criteria
- Include examples of good vs. poor quality
- Test criteria with simple workflows first

### Agents Misunderstand Instructions

**Symptoms:**
- Agents focus on wrong aspects of tasks
- Output format doesn't match expectations
- Agents seem to ignore parts of instructions

**Root Causes:**
- Instructions too complex or unclear
- Missing context about target audience
- Conflicting guidance in different parts

**Solutions:**

1. **Simplify and structure instructions:**
   ```yaml
   # Complex instructions
   instructions: "Research the market and competitive landscape while considering our target audience's pain points and create compelling content that drives engagement and conversions aligned with our brand voice and SEO best practices."
   
   # Clear, structured instructions
   instructions: |
     Target Audience: B2B SaaS marketing directors
     
     Step 1: Market Research
     - Identify 3-5 key pain points for our target audience
     - Research 3-5 competitor approaches to these pain points
     - Find data/statistics supporting these challenges
     
     Step 2: Content Creation
     - Write 1500-word blog post addressing top pain point
     - Include data from research in step 1
     - Follow brand voice guidelines in strategy/voice-messaging.md
     
     Step 3: SEO Optimization
     - Include target keyword in title and first paragraph
     - Add meta description under 160 characters
     - Include 2-3 internal links to relevant content
   ```

2. **Provide context and examples:**
   ```yaml
   instructions: |
     Context: This content is for our monthly newsletter going to 5,000+ B2B marketing professionals. They expect tactical advice they can implement immediately.
     
     Example of good content: "Here's a step-by-step process you can implement this week to improve your email deliverability rates..."
     
     Example of poor content: "Email marketing is important for businesses looking to grow their customer base..."
   ```

3. **Use numbered lists and clear priorities:**
   ```yaml
   instructions: |
     Primary Goal: Generate qualified leads for our B2B SaaS clients
     
     Required Elements (in order of importance):
     1. Address specific pain point from strategy/target-audience.md
     2. Include actionable advice reader can implement
     3. Maintain professional but approachable tone
     4. Include clear call-to-action for consultation
     5. Optimize for target keyword: "B2B marketing automation"
   ```

**Prevention:**
- Break complex tasks into smaller steps
- Always include context about target audience
- Use numbered lists for multi-part instructions
- Test instructions with simple tasks first

---

## Performance Issues

### Workflows Take Too Long

**Symptoms:**
- Single workflows running for hours
- Agents seem to get stuck on research steps
- Multiple back-and-forth iterations

**Root Causes:**
- Instructions too broad or open-ended
- No time limits or scope boundaries
- Over-detailed acceptance criteria

**Solutions:**

1. **Add scope limitations:**
   ```yaml
   instructions: |
     Research B2B SaaS marketing trends:
     1. Focus on last 12 months only
     2. Limit to 3-5 credible sources
     3. Maximum 1 hour research time
     4. Target 500-word summary, not comprehensive report
   ```

2. **Break large tasks into smaller steps:**
   ```yaml
   # Instead of one large step
   - name: "Complete Market Analysis"
   
   # Use multiple focused steps
   - name: "Quick Competitive Scan"
   - name: "Audience Pain Point Research"
   - name: "Trend Analysis Summary"
   ```

3. **Set iteration limits:**
   ```yaml
   instructions: |
     Create blog post outline:
     1. Initial research (30 minutes max)
     2. Create outline with 5-7 main points
     3. Get approval before proceeding to full writing
   
   max_iterations: 2
   ```

**Prevention:**
- Start with minimal viable workflows
- Add time estimates to workflow steps
- Use approval gates before expensive operations

### Too Many Iterations Needed

**Symptoms:**
- Constantly revising agent outputs
- Same feedback being given repeatedly
- Quality doesn't improve with iterations

**Root Causes:**
- Unclear success criteria
- Missing examples in brand bible
- Agents not learning from feedback

**Solutions:**

1. **Improve initial instructions:**
   ```yaml
   # Before: Vague initial guidance
   instructions: "Write a good blog post about marketing automation"
   
   # After: Detailed upfront guidance
   instructions: |
     Target Reader: B2B SaaS marketing directors who are evaluating marketing automation tools
     
     Required Structure:
     1. Hook: Statistics about marketing automation adoption
     2. Problem: Common challenges when implementing automation
     3. Solution: Framework for successful implementation
     4. Proof: 2-3 specific examples or case studies
     5. Action: Clear next steps for readers
     
     Tone: Professional but approachable (see strategy/voice-messaging.md)
     Length: 1500-2000 words
     SEO: Target keyword "marketing automation implementation"
   ```

2. **Create feedback templates:**
   ```
   Common Feedback Templates:
   
   For tone issues:
   "This tone is too [casual/formal] for our [enterprise/startup] audience. Please review strategy/voice-messaging.md section on [specific guideline] and revise to be more [specific adjustment]."
   
   For structure issues:
   "This doesn't follow our standard blog structure. Please reorganize using: 1) Hook with data, 2) Problem identification, 3) Solution framework, 4) Proof points, 5) Clear CTA."
   
   For audience issues:
   "This content isn't specific enough for our target audience of [specific persona]. Please review strategy/target-audience.md and add [specific elements they care about]."
   ```

3. **Build learning into workflows:**
   ```yaml
   - name: "Content Review and Learning"
     instructions: |
       If content needs revision:
       1. Document what specifically needs to change
       2. Reference exact brand bible sections that apply
       3. Provide specific examples of better approaches
       4. Update agent instructions for future reference
   ```

**Prevention:**
- Front-load detailed instructions
- Create comprehensive brand bible with examples
- Document successful patterns for reuse

### Agents Get Stuck in Loops

**Symptoms:**
- Same work being produced repeatedly
- Agents asking for same clarifications
- No progress despite multiple attempts

**Root Causes:**
- Contradictory instructions or acceptance criteria
- Missing information agents need to proceed
- Technical issues with agent configurations

**Solutions:**

1. **Check for contradictions:**
   ```yaml
   # Contradictory example
   instructions: "Write casual, conversational content"
   acceptance_criteria: "Formal, professional tone required"
   
   # Consistent example
   instructions: "Write professional but approachable content"
   acceptance_criteria: "Professional tone that remains accessible and friendly"
   ```

2. **Provide all necessary information:**
   ```yaml
   # Missing context
   instructions: "Create social media post about our new feature"
   
   # Complete context
   instructions: |
     Create LinkedIn post about our new marketing automation feature:
     
     Target Audience: B2B marketing directors at mid-size companies
     Key Message: Save 10+ hours per week on repetitive tasks
     Proof Point: Case study with TechCorp (see strategy/case-studies.md)
     Call-to-Action: "Schedule a demo to see it in action"
     Tone: Professional but enthusiastic (see strategy/voice-messaging.md)
     Length: 150-200 words
     Hashtags: Include #MarketingAutomation #B2BMarketing #Productivity
   ```

3. **Add escape conditions:**
   ```yaml
   instructions: |
     If you need information that isn't available in the brand bible:
     1. Document exactly what information is needed
     2. Suggest where this information might be found
     3. Request human input rather than guessing
     4. Pause workflow until clarification is provided
   ```

**Prevention:**
- Review instructions for internal consistency
- Include all context agents need upfront
- Test workflows with minimal scenarios first

---

## When to Get Help

### Contact Content Engineers When:
- Agents consistently lack needed tools or capabilities
- Technical integrations aren't working
- You need new agent types or workflow features

### Contact Support When:
- System-wide issues affect multiple workflows
- Installation or setup problems
- Performance problems persist despite troubleshooting

### Self-Troubleshoot When:
- Single workflow or agent issues
- Brand voice or quality problems
- Instruction clarity issues

---

## Prevention Best Practices

### Set Yourself Up for Success

1. **Start with solid foundations:**
   - Complete brand bible before running complex workflows
   - Test simple workflows before building complex ones
   - Use examples and templates as starting points

2. **Maintain clear documentation:**
   - Keep brand bible updated with new insights
   - Document successful workflow patterns
   - Save examples of good vs. poor outputs

3. **Build incrementally:**
   - Start with basic workflows and add complexity gradually
   - Test each change before adding the next feature
   - Keep working versions as backups

4. **Establish feedback patterns:**
   - Develop consistent language for common feedback
   - Create templates for recurring quality issues
   - Train yourself to give specific, actionable feedback

### Quick Quality Checklist

Before reporting a problem, verify:

- [ ] Brand bible contains relevant guidelines for this task
- [ ] Workflow instructions are specific and actionable
- [ ] Acceptance criteria are measurable and clear
- [ ] Agent assignments match required capabilities
- [ ] No contradictions between instructions and criteria
- [ ] Target audience and context are clearly defined

### Emergency Quick Fixes

**If workflow is stuck:**
1. Check brand bible completeness
2. Simplify acceptance criteria
3. Break large steps into smaller ones
4. Add specific examples to instructions

**If quality is poor:**
1. Reference specific brand bible sections
2. Provide examples of better approaches
3. Check for contradictory guidance
4. Add target audience context

**If agents are confused:**
1. Use numbered lists for complex instructions
2. Include "what NOT to do" examples
3. Provide complete context upfront
4. Test with simpler tasks first

---

*Still having issues? Check the [glossary](./glossary.md) for term clarifications or review the [system architecture guide](./system-architecture.md) for deeper understanding.*
