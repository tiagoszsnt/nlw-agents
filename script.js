const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

// Verificação básica de elementos
if (!apiKeyInput || !gameSelect || !questionInput || !askButton || !aiResponse || !form) {
    console.error("Algum elemento do HTML não foi encontrado. Verifique os IDs.")
}

// Converter markdown para HTML
const markdownToHTML = (text) => {
    if (typeof showdown === 'undefined') {
        console.error('Showdown não carregado')
        return text
    }
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

// Função que chama a IA
const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const pergunta = `
## Especialidade
Você é um especialista assistente de meta para o jogo ${game}

## Tarefa
Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

## Regras
- Se você não sabe a resposta, responda com 'Não sei'
- Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
- Considere a data atual ${new Date().toLocaleDateString()}
- Seja coerente com o patch atual
- Não invente informações

## Resposta
- Máximo 500 caracteres
- Responda em markdown
- Seja direto

---
Pergunta do usuário: ${question}
`

    const contents = [{
        role: "user",
        parts: [{ text: pergunta }]
    }]

    const tools = [{
        google_search: {}
    }]

    try {
        const response = await fetch(geminiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contents, tools })
        })

        const data = await response.json()

        // Debug (IMPORTANTE)
        console.log('Resposta da API:', data)

        // Tratamento de erro da API
        if (data.error) {
            throw new Error(data.error.message)
        }

        if (!data.candidates || !data.candidates.length) {
            throw new Error('Resposta inválida da API')
        }

        return data.candidates[0].content.parts[0].text

    } catch (error) {
        console.error('Erro na API:', error)
        return 'Erro ao consultar a IA. Verifique sua API Key.'
    }
}

// Envio do formulário
const enviarFormulario = async (event) => {
    event.preventDefault()

    const apiKey = apiKeyInput.value.trim()
    const game = gameSelect.value
    const question = questionInput.value.trim()

    if (!apiKey || !game || !question) {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        const text = await perguntarAI(question, game, apiKey)

        const responseContent = aiResponse.querySelector('.response-content')

        if (!responseContent) {
            throw new Error('Elemento .response-content não encontrado')
        }

        responseContent.innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')

    } catch (error) {
        console.error('Erro geral:', error)
        alert('Erro ao fazer a pergunta. Veja o console.')
    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}

// Evento do formulário
form.addEventListener('submit', enviarFormulario)