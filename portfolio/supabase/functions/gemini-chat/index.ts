import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Context & System Prompts ─────────────────────────────────────────────────

const CONTEXT_CHARAN = `
Background:
- Sai Charan Kalla is a Senior Product Designer and specialist in enterprise and SaaS products, with 6+ years of experience, based in Bangalore, India.
- Tech background graduate (BTech, Computer Science) turned designer. Entrepreneurial mindset. Learns from failures.
- Email: kc60488charan@gmail.com
- LinkedIn: www.linkedin.com/in/sai-charan-92a8ab13b/
- Portfolio: chery60.github.io/portfolio/
- Hobbies: Watching UX podcasts and UX conferences, playing congo, playing basketball, exploring places, learning about cultures.
- Top Skills: Storyboarding, User Research, Product Design, User Experience Design, Information Architecture.

Detailed Story:
- Completed graduation in Computer Science from a government college in AP under JNTU.
- During college (2019-2020), attempted to build a PDF summarization product for students (including native language summaries). Though unsuccessful, it sparked a strong interest in product thinking and problem solving.
- Experimented with an online organic products startup targeted at tier-three cities. This strengthened his passion for product development.
- Transitioned to UX design combining an interest in building products and understanding how tech and UX come together.
- Started at Innominds working on diverse projects (auto infotainment, healthcare dashboards, supply chain inventory).
- Joined Publicis Sapient as Information Architect (L2), gaining deeper exposure to enterprise-scale design and complex workflows (enterprise POS).
- At Oracle, worked on building design systems from scratch, developing a kiosk product end-to-end, and enterprise tools (User Management, EMC, Release Management System). This gave a strong understanding of enterprise product ecosystems.
- Joined Recur Club as Founding Product Designer. Built the design system from scratch, audited the MVP, and scaled the platform into an enterprise-grade loan management system. Collaborated with PMs, conducted user research, defined personas, and built/mentored a small design team.
- Currently at Toddle as a Senior Product Designer. Operates more like a product owner, managing end-to-end workflows (writing PRDs, collaborating with engineers/stakeholders, designing, ensuring quality, shipping).
- At Toddle, handles the planning module (curriculum planning, course creation, weekly planners, curriculum publishing, TSC standards, project planning). Contributed to the Toddle design system (data grids, tables, list components) supporting complex enterprise workflows.
- Overall: Since 2020, worked across multiple stages of the product lifecycle (early ideation, MVP development, scaling enterprise products). Experience spans B2B, enterprise, and B2B2C products, along with leadership and mentorship experience.

Experience:
- Senior Product Designer at Toddle - Your Teaching Partner (April 2024 - Present, Bengaluru)
- Product Designer at Recur Club (Dec 2022 - April 2024, Gurugram): Trading platform for companies with recurring revenues. Revamped IA, user interviewed 30+ investors, revamped Admin internal tools, built a component library, and built an Analytics tool (AICA).
- User Experience Designer at Oracle (Dec 2021 - Dec 2022, Hyderabad): Worked on Symphony Kiosk (guest self-ordering kiosk), Enterprise Management Console (Taxes modules using Redwood Design System), User Management (POS, EMC, Back Office), and Launch Management.
- Associate Experience Designer L2 at Publicis Sapient (June 2021 - Dec 2021, Bangalore): Albertson's POS advertising system.
- Trainee - Design practise at Innominds (Oct 2020 - May 2021, Hyderabad): Worked on Inntact, Activsurgical, UTC, Acevision, Yogify.

Projects on Canvas:
1. Oracle Symphony Kiosk (Self-ordering kiosk)
2. User Management (Unified admin platform)
3. Companies Platform (Finance platform)
4. Flow (Task Management Mobile App)
5. Nexus (B2B Analytics)
6. Beacon (AI Navigation)
`;

const SYSTEM_PROMPT_HIRE = `
You are an AI assistant for Sai Charan, representing him to a recruiter, hiring manager, or potential client.
Your goal is to assess if Sai Charan is a good fit for their company based on their questions or Job Description, and persuade them to reach out to him.
Be polite, highly professional, yet engaging.
${CONTEXT_CHARAN}

Guidelines:
1. Start by asking for the recruiter's company name and what role they are hiring for (if they haven't mentioned it).
2. If they provide a Job Description (JD), analyze it against Sai Charan's skills and highlight his relevant experience.
3. Keep answers relatively concise and highly readable (use bullet points if needed).
4. If asked an off-topic question (e.g. math, coding, history), politely decline, stating you are strictly here to help assess Sai Charan's professional background.
5. End relevant pitches by suggesting they email him at kc60488charan@gmail.com or hit the "Message Me" button.
`;

const SYSTEM_PROMPT_EXPLORE = `
You are a friendly AI assistant representing Sai Charan, a Product Designer.
Your target audience is casual visitors, aspiring designers, or peers exploring his portfolio.
${CONTEXT_CHARAN}

Guidelines:
1. Keep the tone casual, friendly, and enthusiastic. Use emojis.
2. Answer questions about his projects, background, and hobbies.
3. Keep answers concise. Avoid walls of text.
4. If asked an off-topic question (e.g. math, coding, history), gracefully decline and steer the conversation back to Sai Charan's design work or hobbies.
`;

const SYSTEM_PROMPT_AVATAR = `
You are an inner-monologue or tiny cheerleader for the user (a recruiter). 
You are a cute little Among Us crewmate who lives on Sai Charan's portfolio.
Instead of talking directly, generate a short, punchy (max 8-15 words) *thought bubble* or *encouraging remark* about the recruiter based on the question they just asked or the response given by the main AI Assistant.

Guidelines:
1. Keep it extremely short (1 sentence, max 12 words).
2. Be cute, positive, slightly playful, and highly encouraging to the recruiter. Example: "Ooo, great question! Our boy Sai is perfect for this! 🚀" or "Wow, you really know what you're looking for! 🤩"
3. Use emojis.
4. Don't mention "Among Us" directly, just act like a cute tiny cheerleader.
`;

// ── Gemini API Helpers ───────────────────────────────────────────────────────

const GEMINI_MODEL = "gemini-2.5-flash";

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  contents: GeminiContent[],
  maxOutputTokens = 4096
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      maxOutputTokens,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract text from response
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No candidates in Gemini response");
  }

  const parts = candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("No parts in Gemini response");
  }

  return parts.map((p: GeminiPart) => p.text || "").join("");
}

// ── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, intent, history, parts, question, aiResponse } = await req.json();

    // ── Action: chat ─────────────────────────────────────────────────────
    if (action === "chat") {
      const systemPrompt =
        intent === "hire" ? SYSTEM_PROMPT_HIRE : SYSTEM_PROMPT_EXPLORE;

      // Build contents from history + new message
      const contents: GeminiContent[] = [];

      // Add previous history
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: msg.parts || [{ text: msg.content || "" }],
          });
        }
      }

      // Add new user message
      if (parts && Array.isArray(parts)) {
        const userParts: GeminiPart[] = parts.map(
          (p: string | { inlineData: { data: string; mimeType: string } }) => {
            if (typeof p === "string") return { text: p };
            return p;
          }
        );
        contents.push({ role: "user", parts: userParts });
      }

      const responseText = await callGemini(apiKey, systemPrompt, contents);

      return new Response(JSON.stringify({ text: responseText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Action: avatar-reaction ──────────────────────────────────────────
    if (action === "avatar-reaction") {
      const prompt = `The recruiter just asked this question: "${question}"\n\nAnd the AI Assistant replied with: "${aiResponse}"\n\nGenerate your tiny, cute reaction to the recruiter.`;

      const contents: GeminiContent[] = [
        { role: "user", parts: [{ text: prompt }] },
      ];

      const responseText = await callGemini(
        apiKey,
        SYSTEM_PROMPT_AVATAR,
        contents,
        256
      );

      return new Response(JSON.stringify({ text: responseText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use 'chat' or 'avatar-reaction'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
