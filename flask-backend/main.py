





from openai import OpenAI
from flask import Flask, request, send_file, jsonify
import subprocess
import os
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)

# Initialize the OpenAI client for NVIDIA API
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)


@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    try:
        data = request.json
        text = data.get("text")
        print(text)
        output_file = "audio.wav"

        # Ensure the output file is removed before generating a new one
        if os.path.exists(output_file):
            os.remove(output_file)

        # Construct the terminal command
        command = [
            "python3", "python-clients/scripts/tts/talk.py",
            "--server", "grpc.nvcf.nvidia.com:443",
            "--use-ssl",
           # "--metadata", "function-id", "0149dedb-2be8-4195-b9a0-e57e0e14f972",
            "--metadata", "function-id", "5e607c81-7aa6-44ce-a11d-9e08f0a3fe49",

           # "--metadata", "authorization", "Bearer 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",
            "--metadata", "authorization", f"Bearer {os.getenv('NVIDIA_API_KEY')}",

            "--text", text,
            "--voice", "English-US-RadTTS.Female-Neutral",
            "--output", output_file
        ]


        # Run the command
        subprocess.run(command, check=True)

        # Send the generated audio file back to the frontend
        return send_file(output_file, as_attachment=True)

    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Error generating audio", "details": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
    


@app.route('/query-llm', methods=['POST'])
def query_llm():
    try:
        data = request.json
        query = data.get("query")

        # Send the query to the NVIDIA LLM API
        completion = client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct",
            messages=[{"role": "user", "content": query}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
            stream=False
        )

        # Extract the response from the completion
        response = completion.choices[0].message.content
        print("response", response)

        # Return the response as JSON
        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
