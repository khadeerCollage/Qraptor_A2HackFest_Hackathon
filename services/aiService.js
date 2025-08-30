/**
 * AI Service for generating plans from user input text
 */




// Dream Understanding Agent - Streaming via triggerAgent (SSE)
import * as agentService from '@/Services/agentService.js';
let final_plans = []
async function executeDreamUnderstandingAgent() {
  try {
    const { cancel, done } = agentService.triggerAgent({
      appId: '269',
      agentId: '298',
      variables: {},
      onOutputs: (outputs, frame) => {
        console.log('Agent outputs (partial):', outputs);

      },
      onComplete: (outputs, frame) => {
        console.log('Agent completed:', outputs);
        final_plans = outputs.final_plan
      },
      onError: (error) => { console.error('Agent error:', error); }
    });
    await done;
  } catch (error) { console.error('Agent execution failed:', error); }
}



/**
 * Generate AI plan from user input text
 * @param {string} userInput - The user's input text describing their goals or needs
 *@returns {Promise<string>} Generated plan in markdown format
 */
export async function generatePlan(userInput) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  await executeDreamUnderstandingAgent();
  return final_plans;

//   // Mock AI-generated plan based on user input
//   const mockPlans = {
//     fitness: `# Fitness Plan

// ## Goal
// Achieve better physical fitness and health

// ## Weekly Schedule
// - **Monday**: Cardio workout (30 minutes)
// - **Tuesday**: Strength training - Upper body
// - **Wednesday**: Rest day or light yoga
// - **Thursday**: Strength training - Lower body
// - **Friday**: Cardio workout (30 minutes)
// - **Saturday**: Full body workout
// - **Sunday**: Rest day

// ## Nutrition Guidelines
// - Drink 8 glasses of water daily
// - Include protein in every meal
// - Eat 5 servings of fruits and vegetables
// - Limit processed foods

// ## Progress Tracking
// - Weekly weigh-ins
// - Take body measurements monthly
// - Track workout performance
// - Monitor energy levels`,

//     business: `# Business Development Plan

// ## Objectives
// - Increase revenue by 25% in 6 months
// - Expand customer base
// - Improve operational efficiency

// ## Action Items
// ### Month 1-2: Foundation
// - [ ] Market research and competitor analysis
// - [ ] Define target customer personas
// - [ ] Optimize current processes

// ### Month 3-4: Growth
// - [ ] Launch marketing campaigns
// - [ ] Develop new product features
// - [ ] Build strategic partnerships

// ### Month 5-6: Scale
// - [ ] Expand to new markets
// - [ ] Hire additional team members
// - [ ] Implement automation tools

// ## Key Metrics
// - Monthly recurring revenue
// - Customer acquisition cost
// - Customer lifetime value
// - Net promoter score`,

//     learning: `# Learning Plan

// ## Learning Objectives
// Master new skills and expand knowledge base

// ## Study Schedule
// ### Week 1-2: Foundation
// - Research fundamentals
// - Gather learning resources
// - Set up study environment

// ### Week 3-6: Core Learning
// - Daily practice sessions (1-2 hours)
// - Complete online courses
// - Join study groups or communities

// ### Week 7-8: Application
// - Work on practical projects
// - Seek feedback from experts
// - Document progress and learnings

// ## Resources
// - Online courses and tutorials
// - Books and documentation
// - Practice projects
// - Mentorship opportunities

// ## Success Metrics
// - Complete 80% of planned coursework
// - Build 2-3 practical projects
// - Pass relevant certifications`,

//     default: `# Personal Development Plan

// ## Vision
// Create a structured approach to achieve your goals

// ## Phase 1: Planning (Week 1)
// - [ ] Define clear, specific objectives
// - [ ] Break down goals into actionable steps
// - [ ] Set realistic timelines
// - [ ] Identify required resources

// ## Phase 2: Execution (Weeks 2-8)
// - [ ] Daily progress tracking
// - [ ] Weekly review sessions
// - [ ] Adjust strategies as needed
// - [ ] Celebrate small wins

// ## Phase 3: Evaluation (Week 9)
// - [ ] Assess overall progress
// - [ ] Document lessons learned
// - [ ] Plan next steps
// - [ ] Share achievements

// ## Success Factors
// - Consistency in daily actions
// - Regular progress reviews
// - Flexibility to adapt
// - Support from others

// ## Timeline
// - Start Date: Today
// - Review Points: Weekly
// - Target Completion: 8 weeks`
//   };

//   // Determine plan type based on user input keywords
//   const input = userInput.toLowerCase();
//   let planType = 'default';

//   if (input.includes('fitness') || input.includes('workout') || input.includes('exercise') || input.includes('health')) {
//     planType = 'fitness';
//   } else if (input.includes('business') || input.includes('revenue') || input.includes('sales') || input.includes('marketing')) {
//     planType = 'business';
//   } else if (input.includes('learn') || input.includes('study') || input.includes('skill') || input.includes('course')) {
//     planType = 'learning';
//   }

//   return mockPlans[planType];
 
}

/**
 * Format AI response as markdown
 * @param {string} rawText - Raw text to format as markdown
 * @returns {string} Formatted markdown text
 */
export function formatMarkdown(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  // Basic markdown formatting
  let formatted = rawText
    // Ensure proper line breaks
    .replace(/\n\n/g, '\n\n')
    // Format headers if not already formatted
    .replace(/^([A-Z][^.\n]*):?\s*$/gm, '## $1')
    // Format bullet points
    .replace(/^[-*]\s+/gm, '- ')
    // Format numbered lists
    .replace(/^\d+\.\s+/gm, (match) => match)
    // Format bold text for important terms
    .replace(/\b(Goal|Objective|Important|Note|Warning)\b/gi, '**$1**')
    // Ensure proper spacing around headers
    .replace(/^(#{1,6}\s+.+)$/gm, '\n$1\n')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return formatted;
}