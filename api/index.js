export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const question = body?.question;

    if (!question) {
      return res.status(400).json({ error: "question 없음" });
    }

    if (!process.env.OPENAI_KEY) {
      return res.status(500).json({ error: "OPENAI_KEY 없음" });
    }

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.OPENAI_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        tools: [
          {
            type: "file_search",
            vector_store_ids: ["vs_69b3e744fa9c81919220c851d31deaf4"]
          }
        ],
        input: [
          {
            role: "system",
            content:
              "업로드된 교재 기준으로 답해라. 모르면 모른다고 해라."
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(500).json(data);
    }

    let answer = "답 없음";

    if (data.output) {
      for (const item of data.output) {
        if (item.content) {
          for (const c of item.content) {
            if (c.type === "output_text") {
              answer = c.text;
            }
          }
        }
      }
    }

    res.status(200).json({ answer });

  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
