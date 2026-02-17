import { NextRequest } from "next/server";

export const runtime = "edge";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const { json, lang = "ko" } = await req.json();
  if (!json || typeof json !== "string") {
    return Response.json({ error: "json field is required" }, { status: 400 });
  }

  const truncated = json.length > 10000 ? json.substring(0, 10000) + "\n...(truncated)" : json;

  const langInstructions: Record<string, string> = {
    ko: `Analyze the following JSON and provide a clear, concise explanation in Korean.

Include:
1. 이 JSON이 무엇을 나타내는지 한 문장 요약
2. 전체 구조 설명 (타입, 키 수, 깊이)
3. 각 필드의 의미와 용도 추론
4. 데이터의 패턴이나 특이사항
5. 이 JSON이 사용될 수 있는 맥락 (API 응답, 설정 파일 등)`,
    en: `Analyze the following JSON and provide a clear, concise explanation in English.

Include:
1. One-sentence summary of what this JSON represents
2. Overall structure (type, number of keys, depth)
3. Meaning and purpose of each field
4. Data patterns or notable characteristics
5. Likely context (API response, config file, etc.)`,
    ja: `以下のJSONを分析し、日本語で明確かつ簡潔に説明してください。

含める内容：
1. このJSONが何を表しているかの一文要約
2. 全体構造の説明（型、キー数、深さ）
3. 各フィールドの意味と用途の推論
4. データのパターンや特筆事項
5. このJSONが使用される可能性のあるコンテキスト（APIレスポンス、設定ファイルなど）`,
    zh: `分析以下JSON，并用中文提供清晰简洁的说明。

包括：
1. 一句话总结这个JSON表示什么
2. 整体结构说明（类型、键数、深度）
3. 各字段的含义和用途推断
4. 数据的模式或特殊之处
5. 这个JSON可能使用的场景（API响应、配置文件等）`,
  };

  const instruction = langInstructions[lang] || langInstructions.en;

  const prompt = `You are a JSON analysis expert. ${instruction}

Format your response in clean markdown.

JSON:
\`\`\`json
${truncated}
\`\`\``;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `Gemini API error: ${res.status} ${errText}` }, { status: 502 });
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {}
            }
          }
        }
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
