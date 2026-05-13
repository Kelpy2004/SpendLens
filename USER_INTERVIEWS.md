# SpendLens User Interviews

Three conversations I had between May 11–12 while the product was taking shape. I picked people who actually use AI tools regularly — a friend finishing his final year in CS, my uncle who's a senior analyst at TCS, and a developer I connected with through LinkedIn who's been building her own startup. Different contexts, different usage patterns, but the feedback was surprisingly consistent in places.

---

## Interview 1 — A.M.

**Role:** CS final-year student / part-time developer
**Company stage:** Pre-employment (interned at SmartQ as a software dev)
**Date:** May 11, 2026
**Monthly AI spend:** ₹2,000–4,000

---

A.M. is a friend. We talked in Hindi so I've translated the relevant parts. He uses Claude and ChatGPT heavily — mostly for coding help on his final year project and for general stuff. Not a professional context, but exactly the kind of person who accumulates tool spend without really tracking it.

His first reaction to the early UI was honest: he wasn't impressed. The form looked bare and the layout didn't communicate what the product actually did. That was useful to hear because I had been staring at it too long to see it from a fresh set of eyes. After I reworked the design, he came back and said it was much easier to follow.

**What we talked about:**

He said the use case made immediate sense to him — he's in college, has to watch his expenses, and was already wondering whether he was splitting his money between the right tools. He uses both Claude and ChatGPT and had no clear way of comparing what he was getting from each.

**Direct quotes:**

> "Fix the UI brother."

> "A few more upgrades and I will be the first one to use this app — I really need it."

> "I use AI quite a bit now since we're in final year, and since I'm in college I need to monitor my expenses. So it's a perfect place to get the budget set, and even reduce it."

**Most surprising thing:** That the feedback was almost entirely about design, not the audit logic. He understood the value immediately — the barrier was just trusting a product that looked rough.

**What changed because of this:** The UI went through a significant redesign. The form now has a proper hero section, clearer card layout, and a sample audit button so first-time visitors understand what they're getting before filling anything in. The "fix the UI" feedback was blunt, but it was the right call.

---

## Interview 2 — R.K.

**Role:** Senior Analyst
**Company:** TCS
**Date:** May 12, 2026
**Monthly AI spend:** ~₹3,500 (personal tools; company provides additional tooling)

---

R.K. is my uncle and someone I go to when I want a sanity check from someone in the industry. He's been in engineering long enough that he doesn't get excited about tools for the sake of it, which made his opinion useful here.

His company provides an AI tool for most of his work, so the personal spend is on top of that. What he pays for himself is Canva AI and Granola — presentation help and meeting notes. He was clear that he uses AI to handle the repetitive stuff but doesn't trust it on anything critical without reviewing it himself.

**What we talked about:**

I asked him to go through the site without explaining it first. He navigated it without confusion, which was encouraging — the information hierarchy was clear enough that someone who hadn't seen it before could figure out what to do. He liked the idea but immediately shifted to thinking about whether it would be credible in a professional context. His framing was: would a CTO actually forward this report to finance? That question stuck with me.

**Direct quotes:**

> "The interface is easy to get to... good work beta."

> "Still needs work to be done."

> "I use AI just to make work easier and faster — not to trust it blindly, but it's really good for the boring part. Anything important I still check myself."

**Most surprising thing:** He made a joke at the end — "I didn't know you can build sites now." It was funny but also a bit of a reminder that to people outside of tech, building a full-stack web product is still impressive. Easy to forget that when you're in it.

**What changed because of this:** His comment about credibility pushed me to think harder about the report output. The audit results now include a one-sentence reason for every recommendation, and the savings math is shown explicitly so someone could verify it against vendor pricing. The goal is a report that a finance person could forward without being embarrassed about where it came from. He also reinforced something I already believed — show the numbers plainly, don't oversell.

---

## Interview 3 — S.B.

**Role:** Software Developer and Blogger
**Company stage:** Early-stage (Reducate.ai)
**Date:** May 12, 2026
**Monthly AI spend:** ₹10,000+ (Claude Max subscriber)

---

S.B. came through LinkedIn — I've been connecting with developers while looking for internships and she was one of the people I reached out to. She uses Claude as her main tool for both coding and writing, and she's committed enough to it that she's on the Max plan. That's a different profile from the other two — she's past the evaluation stage and has already settled on her stack.

**What we talked about:**

She mentioned there was a point earlier in her workflow where she genuinely needed something like SpendLens — she wanted to compare alternatives before committing to Claude, but there wasn't a clean way to do it. Now that she's on Max she doesn't have the same problem, but she understood the use case from having lived it.

After going through the site she asked a question I hadn't fully considered: is the tool only telling users what they're paying, or is it also telling them whether they're getting value? She suggested ROI reporting — something that shows whether engineers are actually using the tools they're paying for, not just whether the subscription is the right tier. It's a distinct problem from what SpendLens solves today, but it's a real one.

**Direct quotes:**

> "I like your idea, Aryan."

> "If your site shows ROI reports for AI usage, it'd be so much better."

> "There was a time when I needed something like this — I wanted to check whether my spend was worth it compared to alternatives. But now I'm stuck with Claude Max. It's just too good."

**Most surprising thing:** She spends over ₹10,000 a month on AI. That's a lot for an individual developer at an early-stage company. But her reasoning was completely rational — the tool pays for itself in time saved. That's actually the case SpendLens needs to make when it tells someone their spend looks justified.

**What this could change about the product:** The ROI angle — usage relative to cost, not just cost relative to plan tier — is a real feature gap. SpendLens currently flags whether you're on the right plan. It doesn't have any signal on whether the tools are being used enough to justify the plan. That's a harder problem (it requires usage data, not just billing data), but it's worth building toward.

---

## What I Took Away

The three conversations confirmed a few things that were already in the design, and surfaced one thing that wasn't.

Confirmed: People understand the core problem immediately. Nobody needed the value proposition explained. The "I've wondered about this" response was consistent across all three.

Confirmed: The design matters more than I expected. A.M.'s reaction to the early UI was a useful reminder that trust starts with presentation. If the product looks rough, the numbers feel less reliable even if the math is identical.

Confirmed: Credibility of the output is the barrier to sharing. R.K. framing it as "would a CTO forward this?" was exactly right. The audit isn't just for the person running it — it needs to survive being forwarded to someone more skeptical.

New: The ROI question from S.B. is a meaningful product direction that SpendLens doesn't address today. Whether you're on the right plan is step one. Whether you're using the plan you're paying for is step two. That's where the product could go.
