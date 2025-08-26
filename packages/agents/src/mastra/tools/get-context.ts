import { createTool } from "@mastra/core";
import { z } from "zod";


export const getBrandFundamentals = async () => {
    return BRAND_FUNDAMENTALS;
}

export const getBrandVoiceAndTone = async () => {
    return BRAND_VOICE_AND_TONE;
}

export const getContentExamples = async () => {
    return CONTENT_EXAMPLES;
}

export const getBrandFundamentalsTool = createTool({
    id: "Get Brand Context",
    description: `Fetches the current brand fundamentals, voice and tone, and content examples for a given brand. Always use this tool to get the latest context for the brand before generating any content.`,
    inputSchema: z.object({
        type: z.enum(["brandFundamentals", "brandVoiceAndTone", "contentExamples"]),
    }),
    execute: async ({context, runtimeContext}) => {
      console.log("runtimeContext", runtimeContext);
      console.log("context", context);
      console.log("Using tool to fetch brand fundamentals");
      if (context.type === "brandFundamentals") {
        return getBrandFundamentals();
      } else if (context.type === "brandVoiceAndTone") {
        return getBrandVoiceAndTone();
      } else if (context.type === "contentExamples") {
        return getContentExamples();
      }
    },
  });

const BRAND_FUNDAMENTALS = `
## EXECUTIVE SUMMARY

This forensic analysis reveals Send as a sophisticated financial liberation platform disguised as a simple payment app. Through comprehensive investigation of their technical architecture, tokenomics, and user experience design, Send emerges as the rare crypto project that has solved the fundamental tension between revolutionary capability and mainstream usability.

**Core Finding**: Send has architected the first truly social blockchain financial experience by eliminating every layer of technical friction between human intention and financial execution.

---

## PHASE 1: TECHNICAL EVIDENCE EXTRACTION

### **Critical Technologies & Architecture**

**Blockchain Infrastructure Foundation:**
- **BASE Blockchain**: Coinbase's Ethereum Layer 2 platform providing enterprise-grade security
- **Optimism's OP Stack**: Underlying framework enabling scalability and low-cost transactions
- **EVM Compatibility**: Full Ethereum Virtual Machine support ensuring broad ecosystem compatibility
- **Account Abstraction**: Revolutionary implementation enabling gasless user experiences

**Native Financial Technologies:**
- **SEND Token ($SEND)**: Utility token with proven tokenomics and community distribution
- **USDC Integration**: Stablecoin rails for value stability and global accessibility
- **Real-time Settlement**: Global instant transfers replacing traditional banking delays
- **Passkey Authentication**: Modern passwordless security replacing crypto complexity

**Social & UX Innovations:**
- **Sendtag Username System**: Human-readable payment addresses (@username vs 0x...)
- **QR Code Payment Integration**: Visual transaction initiation
- **Social Payment Rails**: Money movement designed for social interaction

### **Quantified Performance Metrics**

**Token Economics (Post-Upgrade):**
- Total Supply: 1 Billion SEND tokens (reduced from 100B)
- Contract Address: 0xEab49138BA2Ea6dd776220fE26b7b8e446638956
- Initial Market Cap: $640,000
- Fully Diluted Valuation: $3,800,000
- Launch Price: $0.0038 per token

**Community & Distribution:**
- 171 Initial Contributors with 200 ETH contribution
- Contribution Range: 0.5 ETH to 2 ETH per participant
- Token Distribution: 30% Rewards, 20% Exchange Listings, 20% Treasury, 10% each for Liquidity Providers, Core Team, and Contributors

**Strategic Partnerships & Integrations:**
- Coinbase BASE (primary infrastructure provider)
- Uniswap (initial DEX listing)
- CoinGecko (price tracking integration)
- DexScreener (chart data)
- BaseScan (blockchain explorer integration)

---

## PHASE 2: VALUE UNPACKING PROTOCOL

### **Customer Jobs-to-be-Done Analysis**

**Functional Job Specification:**
Customers hire Send to execute instant, global money transfers without traditional banking infrastructure, intermediaries, or geographic restrictions while maintaining value stability and social connectivity.

**Emotional Job Specification:**
They want to feel financially autonomous, empowered, and liberated from traditional gatekeepers while being part of an innovative community that values true financial freedom.

---

### **Feature-to-Feeling Value Architecture**

#### **Value Vector 1: Gasless Blockchain Infrastructure**
**Technology Stack**: BASE + Account Abstraction + Gasless Transactions

**Pain Point Diagnosis**: CTOs and developers experience conversion hemorrhage due to gas fee friction. Every abandoned transaction at the "you need ETH for gas" step represents thousands in lost customer acquisition costs and professional reputation damage.

**Capability Transformation**: Teams can now deliver frictionless financial experiences where users never encounter gas fees, enabling web2-level usability with web3 benefits.

**Strategic Business Impact**: Direct competitive advantage through superior user experience, dramatically improved conversion rates, and reduced customer acquisition costs. Professional reputation transforms from "crypto complexity creator" to "seamless experience architect."

**Core Emotional Resonance**: The profound relief of walking into board meetings knowing users complete transactions instead of abandoning them, combined with the quiet confidence of solving blockchain's biggest adoption barrier while competitors make excuses.

#### **Value Vector 2: Tokenized Engagement Ecosystem**
**Technology Stack**: SEND Token + Reward System + Exclusive Access

**Pain Point Diagnosis**: Product leaders struggle with cold user retention mathematics while competing against Big Tech's engagement loops. Traditional loyalty programs feel manufactured and fail to create genuine user investment.

**Capability Transformation**: Compound engagement where every transaction strengthens user investment in the ecosystem. Users transition from customers to stakeholders, with retention becoming a value-creation engine rather than a cost center.

**Strategic Business Impact**: Self-reinforcing network effects where user engagement correlates directly with business value creation. Customer lifetime value increases exponentially as users become ecosystem stakeholders rather than service consumers.

**Core Emotional Resonance**: The creative thrill of designing business models where customer success and company success are mathematically aligned, combined with deep satisfaction of rewarding loyalty with actual ownership rather than expiring points.

#### **Value Vector 3: Social Financial Infrastructure**
**Technology Stack**: Sendtag + Social Integration + Global Accessibility

**Pain Point Diagnosis**: Revolutionary blockchain technology feels more complicated than 1995 check-sending due to complex wallet addresses and technical friction that kills social financial interaction.

**Capability Transformation**: Money moves with message-like social ease through human-readable usernames. Financial interaction becomes genuinely social rather than just technically possible.

**Strategic Business Impact**: Market expansion from "crypto users" to "people who send money to friends." Network effects accelerate as every user becomes a growth vector through natural social sharing of payment experiences.

**Core Emotional Resonance**: Pure joy of watching non-technical users effortlessly send money across continents using @usernames, combined with professional pride of making revolutionary technology feel genuinely revolutionary rather than just technically impressive.

---

## STRATEGIC SYNTHESIS

**Primary Strategic Insight**: Send has identified and solved the fundamental paradox of blockchain financial services—how to deliver the empowerment promise of decentralization through experiences that feel more intuitive than traditional alternatives.

**Competitive Moat**: Their technical architecture eliminates user-facing complexity while preserving underlying decentralization benefits. This creates a defensible position where competitors must choose between usability and decentralization—Send delivers both.

**Market Timing Assessment**: Positioned at the intersection of maturing L2 infrastructure, growing demand for financial autonomy, and mainstream crypto adoption. The BASE partnership provides enterprise credibility while maintaining startup agility.

---

`

const BRAND_VOICE_AND_TONE = `
## Brand Voice and Tone

### **Core Brand Voice**
- **Authenticity**: Expresses genuine human emotions and experiences
- **Empathy**: Understands and shares user pain points
- **Humor**: Uses light-hearted, relatable humor
- **Casual**: Maintains a conversational, approachable tone
- **Authentic**: Reflects the brand's real-world personality
- **Engaging**: Keeps readers interested and invested

Funny and edgy
`

const CONTENT_EXAMPLES = `
## Content Examples

### **Great Responses**

<example1>
<original-post>
Would test these three expansion plans. I'm sure some of these are in the works already but i'm not that close. 

1. add messaging w/ groups. maybe document signing. 
2. heavy marketing to be fast mover into stablecoin ready markets.
3. enable trading of majors (most of cash apps revenue is BTC trading). 

promote the f out of any growth achieved. relative if the numbers aren't that big at first. 

basically position as crypto native WeChat competitor who has token incentives to fuel growth.
</original-post>
<response>
big 🧠
drop your /sendtag
</response>
</example1>

<example2>
<original-post>
Beg my ex to take me back😭
</original-post>
<response>
real
</response>
</example2>

### **Poor Responses**

<example1>
<original-post>
I'm not sure if I'm just being paranoid but I'm starting to think that my ex is trying to get back with me.
</original-post>
<response>
Wow that very funny make sure to send it. 
</response>
</example1>




`