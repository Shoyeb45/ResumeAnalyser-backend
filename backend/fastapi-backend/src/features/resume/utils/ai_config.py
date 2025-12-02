import logging
from openai import AzureOpenAI
from features.resume.config import ResumeAnalyzerConfig
logger = logging.getLogger(__name__)

class AIConfig:
    def __init__(self):
        self.openai_client = self.__initialise_openai_client()
        
    def __initialise_openai_client(self):
        try:
            return AzureOpenAI(
                azure_deployment=ResumeAnalyzerConfig.OPENAI_MODEL,
                api_key=ResumeAnalyzerConfig.OPENAI_API_KEY,
                api_version="2025-01-01-preview",
                azure_endpoint=ResumeAnalyzerConfig.OPENAI_ENDPOINT
            )
        except Exception as e:
            logger.error(f"Failed to initialize openai client, error: {str(e)}")
            
    def chat_with_openai(self, system_prompt: str, user_prompt) -> str | None:
        try:
            # Prepare the chat prompt
            chat_prompt = [
                {
                    "role": "system",
                    "content": [
                        # {"type": "text", "text": "You are an AI assistant that helps people find information."}
                        {"type": "text", "text": system_prompt}
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt}
                    ]
                },
                {
                    "role": "assistant",
                    "content": [
                        {"type": "text", "text": "Hello! How can I help you today?"}
                    ]
                }
            ]
            
            response = self.openai_client.chat.completions.create(
                model=ResumeAnalyzerConfig.MODEL,
                messages=chat_prompt,
                # max_tokens=100,
                max_tokens=4096,  # uncomment this in deployment
                temperature=1,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0,
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Failed to get output from openai, error: {str(e)}")
            return None