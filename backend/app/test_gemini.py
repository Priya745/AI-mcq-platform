import os
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")
genai.configure(api_key=api_key)

print("Available Models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
