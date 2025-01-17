from flask import Flask, request, send_file, jsonify
import subprocess
import os

app = Flask(__name__)

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
            "--metadata", "authorization", "Bearer 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",
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
