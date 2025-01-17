from flask import Flask, request, send_file, jsonify
import subprocess
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    try:
        data = request.json
        text = data.get("text")
        output_file = "audio.wav"

        # Ensure the output file is removed before generating a new one
        if os.path.exists(output_file):
            os.remove(output_file)

        # Construct the terminal command
        command = [
            "python", "python-clients/scripts/tts/talk.py",
            "--server", "grpc.nvcf.nvidia.com:443",
            "--use-ssl",
            "--metadata", "function-id", "0149dedb-2be8-4195-b9a0-e57e0e14f972",
            "--metadata", "authorization", f"Bearer {os.getenv('NVIDIA_API_KEY')}",
            "--text", text,
            "--voice", "English-US.Female-1",
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

@app.route('/generate-text', methods=['POST'])
def generate_text():
    try:
        data = request.json
        prompt = data.get("prompt")

        completion = client.chat.completions.create(
            model="meta/llama-3.3-70b-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
            stream=True
        )

        response_text = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                response_text += chunk.choices[0].delta.content

        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
