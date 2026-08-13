from django.conf import settings
from langchain_google_genai import ChatGoogleGenerativeAI

llm=ChatGoogleGenerativeAI(model="gemini-2.5-flash",google_api_key=settings.GEMINI_API_KEY,temperature=0)