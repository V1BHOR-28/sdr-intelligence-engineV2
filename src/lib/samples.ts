export interface SampleTranscript {
  id: string;
  label: string;
  description: string;
  industry: string;
  transcript: string;
}

export const SAMPLE_TRANSCRIPTS: SampleTranscript[] = [
  {
    id: "cafe-local-seo",
    label: "Local SEO Outreach",
    description: "Cafe prospect with time and budget concerns",
    industry: "Local Business",
    transcript: `SDR: Hi, this is Vibhor calling from Rank Local. Am I speaking with the manager of Bossco Cafe?
Client: Yes, this is Sarah. I'm a bit busy right now.
SDR: I'll be brief, Sarah. We help cafes in Delhi NCR automate their Google Business Profile reviews to capture more local foot traffic. Are you currently using any tools to manage your local SEO?
Client: Not really. We just rely on organic walk-ins. We looked at Yelp before, but honestly, we don't have the bandwidth to manage software right now. Plus, budget is tight this quarter.
SDR: Totally understand the time and budget constraints. If I could send over a quick case study showing how a cafe nearby boosted their monthly revenue without any manual work, would you be open to taking a look?
Client: Sure, you can send that over. My email is sarah@bosscocafe.com.
SDR: Perfect. I'll send the case study today and follow up Thursday. Have a great afternoon, Sarah.`,
  },
  {
    id: "saas-onboarding",
    label: "SaaS Renewal Risk",
    description: "Mid-market SaaS client considering switching to a competitor",
    industry: "SaaS",
    transcript: `SDR: Hi Marcus, thanks for taking the call. Wanted to check in on how Q3 went with the team using our platform.
Client: Hey. Yeah, look, I'll be honest — we've been evaluating options. Your tool works fine, but the pricing jumped 30% on renewal and HubSpot reached out with a bundled deal that includes CRM and analytics.
SDR: I appreciate you being direct. The pricing change reflected the new analytics module — but if bundling is what you need, I'd like to understand the gaps. What's missing today?
Client: Mainly the CRM integration depth and the reporting. Our sales team lives in HubSpot and toggling between two systems is killing adoption. We have 40 seats and maybe 15 are actually using your tool weekly.
SDR: That's helpful — and a real problem we can solve. We have a native HubSpot connector launching in two weeks that syncs bidirectionally. If I can get you into the beta and lock in your current pricing for 24 months, would that change the conversation?
Client: That's actually interesting. Send me the beta details and the revised quote. I need to bring this to my VP by Friday.
SDR: Will do. I'll send everything within the hour and we can reconvene Thursday at 2pm?
Client: Thursday at 2 works. Thanks for not making this painful.`,
  },
  {
    id: "logistics-cold",
    label: "Cold Outreach — Logistics",
    description: "Cold call to a logistics director, gatekeeper resistance",
    industry: "Logistics",
    transcript: `SDR: Hi, this is Priya from FreightOps. May I speak with Mr. Daniels?
Gatekeeper: He's in a meeting. Can I ask what this is regarding?
SDR: Of course — I'm reaching out about route optimization for the eastern corridor. We've helped three carriers in your segment cut fuel costs by 12%. Is there a better time to reach him?
Gatekeeper: He doesn't take cold calls. You can email info@company.com.
SDR: Understood. Just so the email is useful — what's the biggest challenge his ops team is facing right now?
Gatekeeper: Look, I can't share that. Send the email.
SDR: Will do. I'll send a short note with the case study attached. Thanks for your help.`,
  },
  {
    id: "agency-warm",
    label: "Warm Lead — Agency",
    description: "Agency owner who downloaded a whitepaper, interested but cautious",
    industry: "Marketing Agency",
    transcript: `SDR: Hi David, this is Alex from ScaleStack. You downloaded our whitepaper on retainers last week — wanted to see if anything in there resonated.
Client: Yeah, actually. We're a 12-person agency and our retainer model is breaking. Clients want flexibility, we want predictability. The framework you laid out made sense but I'm not sure how to implement it.
SDR: That's exactly the gap we fill. We help agencies transition from project-based to outcome-based retainers without losing cash flow. Quick question — what's your current average retainer size and how many active clients do you have?
Client: About $8K/month average, 14 active clients. We've tried shifting to value pricing but the team pushes back because scope creep was brutal last time.
SDR: Totally fair. We have a phased rollout that protects your team from scope creep in month one. We've done this with 40+ agencies your size. Would a 30-min working session next Tuesday work to walk you through it?
Client: Tuesday afternoon works. Send me a calendar invite — david@scaleforge.studio. And honestly, if this works, I'd want to pilot with two clients in Q4.
SDR: That's exactly the right starting point. I'll send the invite with a short pre-read so we don't waste the 30 minutes.`,
  },
];
