const ai = require("./gemini/geminiAI")

async function getResponse(prompt) {
    const chat = ai.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 100
        }
    })
    const res = await chat.sendMessage(prompt)
    console.log(res.response.text())
}

getResponse("How are you?")