


from gtts import gTTS
import os
from io import BytesIO

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
        # Parse JSON data from the request
        data = request.json
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' in request body"}), 400
        
        text = data.get("text")
        
        # Validate input text
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        # Generate TTS audio using gTTS
        tts = gTTS(text)
        
        # Save the audio to a BytesIO stream (in-memory file)
        audio_stream = BytesIO()
        tts.write_to_fp(audio_stream)
        audio_stream.seek(0)  # Reset stream position to the beginning

        # Return the audio file as a response
        return send_file(
            audio_stream,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="output.mp3"
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500





    ## #BLWOI CODE NOT WORKING
    ## DNS resolution failed for grpc.nvcf.nvidia.com:443: C-ares status is not ARES_SUCCESS qtype=AAAA name=grpc.nvcf.nvidia.com is_balancer=0: Could not contact DNS servers

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
            "--metadata", "function-id",  "0149dedb-2be8-4195-b9a0-e57e0e14f972",
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
        print("GOT QUYERY ", query)

        # Send the query to the NVIDIA LLM API
        
        completion = client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct",
            messages=[{"role": "user", "content": query}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
            stream=False
        )

        print("HERE WAITING FOR COMPLETION ")
        print(completion)
        

        # Extract the response from the completion
        response = completion.choices[0].message.content

        print("response", response)

        # Return the response as JSON
        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
