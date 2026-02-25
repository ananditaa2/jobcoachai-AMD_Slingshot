export async function getAIResponse(userInput) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/meta-llama/Llama-3-8B-Instruct",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: userInput,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7
        }
      })
    }
  );

  const data = await response.json();

  return data[0]?.generated_text || "No response.";
}
