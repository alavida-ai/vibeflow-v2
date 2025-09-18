# How Workflows Work: From YAML to Execution

This diagram shows the complete journey of how Marketing Architects create workflows and how the Vibeflow system executes them.

## Workflow Creation & Compilation Process

```mermaid
graph TD
    %% Styling
    classDef architect fill:#FFE4B5,stroke:#B8860B,stroke-width:2px
    classDef system fill:#E6F3FF,stroke:#4682B4,stroke-width:2px
    classDef agent fill:#E8F5E8,stroke:#2D5A3D,stroke-width:2px
    classDef file fill:#F0F0F0,stroke:#666,stroke-width:2px

    %% Marketing Architect Work
    subgraph MA_WORK ["Marketing Architect Creates"]
        THOMAS["Thomas<br/>Marketing Architect"]
        YAML["blog-creation.yaml<br/>• Step 1: Research topic<br/>• Step 2: Write draft<br/>• Step 3: Review & edit"]
        BIBLE["Brand Bible<br/>• Voice & tone<br/>• Target audience<br/>• Key messages"]
    end

    %% System Processing
    subgraph SYSTEM ["Vibeflow System Processing"]
        COMPILE["Compiler<br/>Converts YAML to<br/>executable workflow"]
        MASTRA["blog-creation.mastra<br/>Executable workflow file"]
        CURSOR["Cursor Agent<br/>AI Project Manager"]
    end

    %% Agent Execution
    subgraph AGENTS ["AI Agent Specialists"]
        RESEARCH["Research Agent<br/>• Web search<br/>• Competitor analysis<br/>• Market trends"]
        CONTENT["Content Agent<br/>• Writing<br/>• Editing<br/>• SEO optimization"]
        REVIEW["Review Process<br/>• Quality check<br/>• Brand alignment<br/>• Final approval"]
    end

    %% Connections
    THOMAS --> YAML
    THOMAS --> BIBLE
    YAML --> COMPILE
    COMPILE --> MASTRA
    MASTRA --> CURSOR
    CURSOR --> BIBLE
    CURSOR --> RESEARCH
    CURSOR --> CONTENT
    CURSOR --> REVIEW

    %% Apply styles
    class THOMAS,YAML,BIBLE architect
    class COMPILE,MASTRA,CURSOR system
    class RESEARCH,CONTENT,REVIEW agent
```

## Real Workflow Execution Flow

```mermaid
sequenceDiagram
    participant Thomas as Thomas (Marketing Architect)
    participant Client as Sarah (End User)
    participant Cursor as Cursor Agent
    participant Bible as Brand Bible
    participant Research as Research Agent
    participant Content as Content Agent

    Note over Thomas: Setup Phase (One Time)
    Thomas->>Bible: Creates comprehensive brand strategy
    Thomas->>Cursor: Uploads blog-creation.yaml workflow

    Note over Client: Content Request
    Client->>Cursor: "Write a blog post about our new feature"
    
    Note over Cursor: Execution Phase
    Cursor->>Bible: Consults brand strategy
    Bible-->>Cursor: Returns voice, audience, positioning
    
    Cursor->>Research: "Research this topic with brand context"
    Research-->>Cursor: Returns research findings
    
    Cursor->>Content: "Write blog post using research + brand context"
    Content-->>Cursor: Returns draft blog post
    
    Cursor->>Thomas: Presents final content for approval
    Thomas-->>Cursor: Approves or provides feedback
    
    Cursor->>Client: Delivers approved, brand-aligned content
```

## YAML Workflow Structure

```mermaid
graph LR
    subgraph YAML_FILE ["blog-creation.yaml"]
        WORKFLOW["workflow:<br/>name: Blog Creation<br/>description: Create SEO blog posts"]
        
        subgraph STEPS ["steps:"]
            STEP1["step_1:<br/>name: Research<br/>prompt: Research the topic...<br/>acceptance: Comprehensive research<br/>agent: research-agent"]
            
            STEP2["step_2:<br/>name: Draft<br/>prompt: Write blog post...<br/>acceptance: Well-structured draft<br/>agent: content-agent"]
            
            STEP3["step_3:<br/>name: Review<br/>prompt: Review and optimize...<br/>acceptance: Publication-ready<br/>agent: content-agent"]
        end
    end
    
    subgraph EXECUTION ["When Executed"]
        EXE1["Cursor Agent reads step_1<br/>Consults brand bible<br/>Delegates to research-agent"]
        
        EXE2["Research agent completes work<br/>Cursor validates against acceptance criteria<br/>Proceeds to step_2"]
        
        EXE3["Content agent writes draft<br/>Cursor validates<br/>Proceeds to step_3"]
        
        EXE4["Final review and optimization<br/>Ready for client delivery"]
    end
    
    STEP1 --> EXE1
    STEP2 --> EXE2  
    STEP3 --> EXE3
    EXE3 --> EXE4

    %% Styling
    classDef yamlStyle fill:#FFF2CC,stroke:#D6B656,stroke-width:2px
    classDef exeStyle fill:#E8F5E8,stroke:#2D5A3D,stroke-width:2px
    
    class WORKFLOW,STEP1,STEP2,STEP3 yamlStyle
    class EXE1,EXE2,EXE3,EXE4 exeStyle
```

## Key Insights for Marketing Architects

### Your Strategic Control Points
- **Brand Bible**: Your strategy drives every AI decision
- **YAML Workflows**: Your process design becomes automated execution
- **Quality Gates**: You define what "good enough" means at each step

### The Magic You Enable
- **For Clients**: Complex marketing processes feel like simple conversations
- **For Your Business**: Consistent, scalable, high-quality output
- **For AI Agents**: Clear instructions and brand context for perfect execution

### Why This Works
1. **Strategic Separation**: You focus on strategy, AI handles execution
2. **Brand Consistency**: Every output reflects your brand bible
3. **Quality Control**: Built-in review points ensure excellence
4. **Scalability**: One workflow serves unlimited content requests
