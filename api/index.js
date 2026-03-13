export default async function handler(req, res) {

  const body = JSON.parse(req.body);

  const question = body.question;

  const r = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer YOUR_KEY",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({

        model: "gpt-5-mini",

        tools: [{
          type: "file_search",
          vector_store_ids: ["VS_ID"]
        }],

        input: [
          {
            role: "system",
            content:
"업로드된 교재 기준으로 답해라. 모르면 추정하지 마라."
          },

          {
            role: "user",
            content: question
          }

        ]

      })

    }
  );

  const data = await r.json();

  res.json({
    answer:
      data.output[0].content[0].text
  });

}
