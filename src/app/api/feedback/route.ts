import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const LABEL_MAP: Record<string, string> = {
  bug: "bug",
  feature: "enhancement",
  general: "feedback",
};

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_FEEDBACK_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Feedback service is not configured" },
      { status: 503 }
    );
  }

  let body: { type?: string; description?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type = "general", description, email } = body;
  if (!description || !description.trim()) {
    return NextResponse.json(
      { error: "Description is required" },
      { status: 400 }
    );
  }

  const typeLabel = LABEL_MAP[type] || "feedback";
  const title = `[${type === "bug" ? "Bug" : type === "feature" ? "Feature" : "Feedback"}] ${description.slice(0, 80)}`;

  let issueBody = `## Description\n\n${description}\n\n---\n*Submitted via in-app feedback widget*`;
  if (email) {
    issueBody += `\n*Contact: ${email}*`;
  }

  const owner = process.env.GITHUB_REPO_OWNER || "jm614qk2l";
  const repo = process.env.GITHUB_REPO_NAME || "jsonize";

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      body: issueBody,
      labels: [typeLabel, "user-submitted"],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("GitHub API error:", res.status, errText);
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again later." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
