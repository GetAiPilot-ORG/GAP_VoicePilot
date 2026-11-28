export interface CallLeadEvaluation {
  status: 'customer' | 'churned' | 'prospect';
  category: 'qualified' | 'dropped' | 'in_progress' | 'unanswered';
  outcomeHeadline: string;
  notes: string;
  durationSeconds: number;
  hasCustomerSpoken: boolean;
  insights: {
    service: string;
    budget: string;
    timeline: string;
  };
}

export function parseCallDurationInSeconds(duration: any): number {
  if (typeof duration === 'number') return Math.max(0, Math.floor(duration));
  if (typeof duration === 'string') {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2 && !parts.some(isNaN)) {
      return parts[0] * 60 + parts[1];
    } else if (!isNaN(Number(duration))) {
      return Math.max(0, Math.floor(Number(duration)));
    }
  }
  return 0;
}

export function evaluateCallLeadOutcome(callData: {
  call_duration?: string | number;
  duration_seconds?: number;
  transcript?: Array<{ role: string; content?: string; message?: string }>;
  whatsapp_summary?: string | null;
  notes?: string | null;
  variables?: Record<string, any>;
  extracted_data?: any;
  ended_reason?: string;
  status?: string;
}): CallLeadEvaluation {
  // 1. Calculate duration
  const durationSeconds = callData.duration_seconds !== undefined
    ? parseCallDurationInSeconds(callData.duration_seconds)
    : parseCallDurationInSeconds(callData.call_duration);

  // 2. Analyze transcript for customer participation
  const transcript = Array.isArray(callData.transcript) ? callData.transcript : [];
  const customerTurns = transcript.filter((t: any) => {
    const role = (t.role || '').toLowerCase();
    const text = (t.content || t.message || '').trim();
    return (role === 'user' || role === 'customer' || role === 'caller') && text.length > 0;
  });
  const hasCustomerSpoken = customerTurns.length > 0;

  // 3. Summaries & Keywords
  const rawSummary = (callData.whatsapp_summary || callData.notes || '').trim();
  const lowerSummary = rawSummary.toLowerCase();

  const negativeKeywords = [
    'no conversation occurred',
    'no purpose, discussion points, or next steps',
    'no purpose',
    'no discussion points',
    'no response',
    'did not respond',
    'did not answer',
    'could not be reached',
    'hung up',
    'hang up',
    'disconnected immediately',
    'call was cut',
    'cut the call',
    'call dropped',
    'not interested',
    'wrong number',
    'busy',
    'voicemail',
    'unanswered',
    'declined',
    'refused to speak'
  ];

  const isExplicitlyNegativeOrDropped = negativeKeywords.some(kw => lowerSummary.includes(kw));

  const callStatusStr = (callData.status || '').toLowerCase();
  const endedReasonStr = (callData.ended_reason || '').toLowerCase();
  const isTechnicalNoAnswer =
    callStatusStr === 'no-answer' ||
    callStatusStr === 'busy' ||
    callStatusStr === 'failed' ||
    callStatusStr === 'canceled' ||
    endedReasonStr.includes('no-answer') ||
    endedReasonStr.includes('busy');

  // 4. Extract structured variables if present
  let extractedDetailsBlock = '';
  const vars = callData.variables || callData.extracted_data;
  if (vars && typeof vars === 'object' && Object.keys(vars).length > 0) {
    extractedDetailsBlock += '\n--- Extracted Details ---\n';
    for (const [key, val] of Object.entries(vars)) {
      extractedDetailsBlock += `${key}: ${val}\n`;
    }
  }

  // 5. Smart Extraction for Service, Budget, Timeline
  let service = "General Inquiry";
  if (lowerSummary.includes('website')) service = "Website Development";
  if (lowerSummary.includes('marketing')) service = "Digital Marketing";
  if (lowerSummary.includes('dentist') || lowerSummary.includes('dental')) service += " (Dental)";
  if (lowerSummary.includes('real estate')) service += " (Real Estate)";

  let budget = "To be discussed";
  let budgetMatch = rawSummary.match(/((?:rs\.?|inr|₹|\$)\s*\d+(?:,\d+)*(?:\.\d+)?(?:k|m|lakh|thousand)?)/i);
  if (!budgetMatch) budgetMatch = rawSummary.match(/(\d+(?:,\d+)*(?:\.\d+)?(?:k|m|lakh|thousand)?)\s*(?:budget|cost|price|rupees|rs)/i);
  if (!budgetMatch) budgetMatch = rawSummary.match(/(?:budget|price|cost).*?(\d+(?:,\d+)*(?:\.\d+)?(?:k|m|lakh|thousand)?)/i);
  if (budgetMatch) budget = budgetMatch[1];
  if (budget && !budget.match(/rs|inr|₹|\$/i) && budget !== 'To be discussed') budget = '₹' + budget;

  let timeline = "Not specified";
  if (lowerSummary.includes('urgent') || lowerSummary.includes('asap') || lowerSummary.includes('immediate')) timeline = "Immediate";
  else if (lowerSummary.includes('next week') || lowerSummary.includes('1 week') || lowerSummary.includes('a week')) timeline = "Next Week";
  else if (lowerSummary.includes('week')) timeline = "Within a week";
  else if (lowerSummary.includes('month')) timeline = "Within a month";

  const insights = { service, budget, timeline };
  const hasExtractedRequirements = service !== "General Inquiry" || budget !== "To be discussed";

  // ── DECISION LOGIC ──────────────────────────────────────────────────────────

  // Scenario 1: Unanswered / Busy / 0s duration
  if (durationSeconds === 0 || isTechnicalNoAnswer) {
    const outcomeHeadline = 'Call Unanswered / Busy';
    const notes = [
      `Call Unanswered / Busy via VoicePilot (Duration: 0s)`,
      `Status: Lead did not answer or was busy. Scheduled for follow-up.`
    ].join('\n');

    return {
      status: 'churned',
      category: 'unanswered',
      outcomeHeadline,
      notes,
      durationSeconds,
      hasCustomerSpoken: false,
      insights
    };
  }

  // Scenario 2: Lead cut call / Silent pickup / No conversation occurred
  if (!hasCustomerSpoken || durationSeconds < 12 || isExplicitlyNegativeOrDropped) {
    const isNotInterested = lowerSummary.includes('not interested') || lowerSummary.includes('wrong number') || lowerSummary.includes('declined');
    const outcomeHeadline = isNotInterested 
      ? `Call Completed - Not Interested (${durationSeconds}s)`
      : `Call Dropped / No Response (${durationSeconds}s)`;

    let notes = isNotInterested
      ? `Call Completed - Lead Not Interested / Disqualified (Duration: ${durationSeconds}s)\nStatus: Disqualified / Dropped\n`
      : `Call Dropped / No Response via VoicePilot (Duration: ${durationSeconds}s)\nStatus: Caller picked up but did not reply or disconnected early.\n`;

    if (rawSummary) {
      notes += `\n--- Actionable Summary ---\n${rawSummary}\n`;
    }

    return {
      status: 'churned',
      category: 'dropped',
      outcomeHeadline,
      notes,
      durationSeconds,
      hasCustomerSpoken,
      insights
    };
  }

  // Scenario 3: Real engagement & conversation took place -> QUALIFIED LEAD
  if (durationSeconds >= 15 && hasCustomerSpoken && !isExplicitlyNegativeOrDropped && (hasExtractedRequirements || customerTurns.length >= 2 || rawSummary.length > 40)) {
    let notes = `Call Completed & Qualified via VoicePilot (Duration: ${durationSeconds}s)\n`;
    if (extractedDetailsBlock) notes += extractedDetailsBlock;
    if (callData.notes) notes += `\n--- AI Summary ---\n${callData.notes}\n`;
    if (callData.whatsapp_summary) notes += `\n--- Actionable Summary ---\n${callData.whatsapp_summary}\n`;
    notes += `\n--- Extracted Insights ---\nService: ${service}\nBudget: ${budget}\nTimeline: ${timeline}\n`;

    return {
      status: 'customer',
      category: 'qualified',
      outcomeHeadline: 'AI Insights & Summary Captured',
      notes,
      durationSeconds,
      hasCustomerSpoken: true,
      insights
    };
  }

  // Scenario 4: Partial engagement / Incomplete -> PROSPECT (In Progress)
  let notes = `Call In Progress via VoicePilot (Duration: ${durationSeconds}s)\nStatus: Partial conversation recorded.\n`;
  if (rawSummary) notes += `\n--- AI Summary ---\n${rawSummary}\n`;

  return {
    status: 'prospect',
    category: 'in_progress',
    outcomeHeadline: `Call In Progress (${durationSeconds}s)`,
    notes,
    durationSeconds,
    hasCustomerSpoken,
    insights
  };
}
