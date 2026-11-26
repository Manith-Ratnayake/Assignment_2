import fastapi
from dotenv import load_dotenv
import os

load_dotenv()



app = fastapi(title="Merideth Group")



@dataclass
class Settings():
    llm_api_key : os.getenv("OPENAI_API_KEY")


@app.post("/")
def main():
    return ""
