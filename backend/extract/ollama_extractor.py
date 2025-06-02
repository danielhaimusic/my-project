import ollama
import openai
import json
from scripts.ai import initial_prompt

def extract_with_ollama(text: str, model_name: str = "deepseek-r1:7b") -> dict:
    """
    Sends the extracted PDF text to a local Ollama server running Mistral 7B and returns structured data as a dict.
    """
    # Ensure model is available (optional, can be removed for performance)
    try:
        ollama.show(model_name)
    except ollama.ResponseError:
        ollama.pull(model_name)

    response = ollama.chat(model=model_name, messages=[
        {'role': 'system', 'content': initial_prompt},
        {'role': 'user', 'content': text}
    ])
    # Try to parse the model's response as JSON
    content = response['message']['content']
    try:
        # Find the first JSON object in the response
        start = content.find('{')
        end = content.rfind('}') + 1
        json_str = content[start:end]
        return json.loads(json_str)
    except Exception as e:
        raise RuntimeError(f"Failed to parse Ollama response as JSON: {e}\nResponse: {content}")

def extract_with_chatgpt(text: str, model_name: str = "gpt-3.5-turbo") -> dict:
    """
    Sends the extracted PDF text to the ChatGPT API (openai>=1.0.0) and returns structured data as a dict.
    The prompt (initial_prompt) is used as system context.
    """
    client = openai.OpenAI()
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {'role': 'system', 'content': initial_prompt},
            {'role': 'user', 'content': text}
        ]
    )
    content = response.choices[0].message.content
    try:
        # Find the first JSON object in the response
        start = content.find('{')
        end = content.rfind('}') + 1
        json_str = content[start:end]
        return json.loads(json_str)
    except Exception as e:
        raise RuntimeError(f"Failed to parse ChatGPT response as JSON: {e}\nResponse: {content}")
