const GEMINI_API_KEY = CONFIG?.GEMINI_API_KEY || '';
const GROQ_API_KEY = CONFIG?.GROQ_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let currentPlan = [];
let currentStep = 0;

document.getElementById('generateBtn').addEventListener('click', startNotesGeneration);
document.getElementById('downloadBtn').addEventListener('click', downloadNotes);

function getPlanningPrompt() {
    return `You are a study plan generator. Return ONLY a JSON array of study sections.

Format MUST be exactly:
[
    {
        "title": "clear section title",
        "prompt": "detailed instructions for generating this section"
    }
]

Rules:
1. Return ONLY the JSON array, nothing else
2. No HTML, markdown, or explanatory text
3. Each section should cover one main concept
4. Start with basics, progress to complex topics
5. Ensure JSON is valid and properly formatted`;
}

function getContentPrompt() {
    return `You MUST format your response using HTML tags only. Format requirements:

<div class="content-section">
    <h1>Main topics use h1 tags</h1>
    
    <h2>Subtopics use h2 tags</h2>
    <p>All explanatory text must be in paragraph tags</p>
    
    <h3>Points and Details</h3>
    <ul>
        <li>List items must use proper list tags</li>
        <li>Each point should be properly structured</li>
    </ul>
    
    <pre><code class="language-javascript">
    // Code examples must use pre and code tags
    function example() {
        return "Like this";
    }
    </code></pre>
    
    <table>
        <thead>
            <tr><th>Column 1</th><th>Column 2</th></tr>
        </thead>
        <tbody>
            <tr><td>Data</td><td>Description</td></tr>
        </tbody>
    </table>
</div>`;
}

// Update the queryAI function to handle planning vs content responses differently
async function queryAI(prompt, isPlanning = false, retryWithGroq = true) {
    try {
        const systemPrompt = isPlanning ? getPlanningPrompt() : getContentPrompt();
        let formattedPrompt;
        
        if (isPlanning) {
            formattedPrompt = `${systemPrompt}\n\nIMPORTANT: You MUST return ONLY valid JSON array. No HTML, no markdown, no extra text.\n\nCreate a study plan for: ${prompt}`;
        } else {
            formattedPrompt = `${systemPrompt}\n\nIMPORTANT: Return content in HTML format for: ${prompt}`;
        }
        
        const response = await queryGemini(formattedPrompt);
        return isPlanning ? response : formatResponse(response);
    } catch (error) {
        if (retryWithGroq) {
            console.log('Falling back to Groq API...');
            return await queryGroq(prompt, isPlanning);
        }
        throw error;
    }
}

// Add a function to get system prompt
function getSystemPrompt() {
    return `You MUST format your response using HTML tags only. Format requirements:

<div class="content-section">
    <h1>Main topics use h1 tags</h1>
    
    <h2>Subtopics use h2 tags</h2>
    <p>All explanatory text must be in paragraph tags</p>
    
    <h3>Points and Details</h3>
    <ul>
        <li>List items must use proper list tags</li>
        <li>Each point should be properly structured</li>
    </ul>
    
    <pre><code class="language-javascript">
    // Code examples must use pre and code tags
    function example() {
        return "Like this";
    }
    </code></pre>
    
    <table>
        <thead>
            <tr><th>Column 1</th><th>Column 2</th></tr>
        </thead>
        <tbody>
            <tr><td>Data</td><td>Description</td></tr>
        </tbody>
    </table>
</div>`;
}

// Update queryGemini to handle the system prompt
async function queryGemini(prompt) {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text;
}

// Update queryGroq to use the same system prompt
async function queryGroq(prompt) {
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{
                role: 'system',
                content: getSystemPrompt()
            }, {
                role: 'user',
                content: prompt
            }]
        })
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.choices[0].message.content;
}

async function startNotesGeneration() {
    if (!GEMINI_API_KEY && !GROQ_API_KEY) {
        alert('No API keys configured');
        return;
    }

    const userInput = document.getElementById('userInput').value;
    if (!userInput) {
        alert('Please enter a topic');
        return;
    }

    // Show progress section
    document.querySelector('.progress-section').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'none';
    const outputDiv = document.getElementById('notesOutput');
    outputDiv.innerHTML = '';

    try {
        // Get the plan
        const planningPrompt = `${userInput}`;
        const planResponse = await queryAI(planningPrompt, true);
        
        // Clean and parse JSON
        let cleanJson = planResponse
            .trim()
            .replace(/^[^[]*/, '')  // Remove anything before [
            .replace(/][^]*$/, ']')  // Remove anything after ]
            .replace(/```json\s*|\s*```/g, ''); // Remove code blocks
            
        try {
            currentPlan = JSON.parse(cleanJson);
        } catch (jsonError) {
            console.error('JSON parsing failed:', jsonError);
            console.log('Received response:', planResponse);
            throw new Error('Failed to generate a valid study plan. Please try again.');
        }

        // Validate plan structure
        if (!Array.isArray(currentPlan) || currentPlan.length === 0) {
            throw new Error('Invalid plan format received');
        }

        currentStep = 0;
        
        // Generate notes section by section
        let fullNotes = [];
        for (let i = 0; i < currentPlan.length; i++) {
            updateProgress(i, currentPlan.length);
            const section = currentPlan[i];
            
            if (!section.title || !section.prompt) {
                console.warn(`Skipping invalid section at index ${i}:`, section);
                continue;
            }
            
            const content = await queryAI(section.prompt, false);
            fullNotes.push(`
                <div class="notes-section">
                    ${content}
                </div>
            `);
            
            // Update display with all sections processed so far
            outputDiv.innerHTML = fullNotes.join('\n');
        }

        document.querySelector('.progress-section').style.display = 'none';
        document.getElementById('downloadBtn').style.display = 'block';
    } catch (error) {
        outputDiv.textContent = `Error: ${error.message}`;
        document.querySelector('.progress-section').style.display = 'none';
    }
}

function updateProgress(current, total) {
    const progress = document.querySelector('.progress');
    const percentage = (current / total) * 100;
    progress.style.width = `${percentage}%`;
    document.getElementById('currentStep').textContent = 
        `Generating section ${current + 1} of ${total}...`;
}

function downloadNotes() {
    const content = document.getElementById('notesOutput').innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Update formatResponse function
function formatResponse(text) {
    // Remove markdown code block syntax
    text = text.replace(/```html?\s*([\s\S]*?)\s*```/g, '$1');
    text = text.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
    
    // Sanitize potentially unsafe HTML
    const sanitizeHtml = (html) => {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    };

    // Process code blocks first
    text = text.replace(/<pre><code.*?>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
        return match.replace(code, sanitizeHtml(code));
    });

    // Add classes for styling
    text = text
        .replace(/<h1>/g, '<h1 class="main-heading">')
        .replace(/<h2>/g, '<h2 class="sub-heading">')
        .replace(/<h3>/g, '<h3 class="sub-heading-2">')
        .replace(/<pre><code/g, '<pre class="code-block"><code')
        .replace(/<table>/g, '<table class="notes-table">')
        .replace(/<ul>/g, '<ul class="bullet-list">')
        .replace(/<p>/g, '<p class="content-paragraph">');

    // Remove duplicate content-section divs
    text = text.replace(/<div class="content-section">/g, '');
    text = text.replace(/<\/div>\s*<\/div>/g, '</div>');

    // Clean up whitespace
    text = text.replace(/\n\s*\n/g, '\n');
    
    return `<div class="notes-section">${text}</div>`;
}