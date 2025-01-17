import React, { useState } from "react";

function App() {
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioSrc, setAudioSrc] = useState("");

  const handleStartMeeting = async () => {
    setMeetingStarted(true);

    const agenda = document.getElementById("agenda").value;

    try {
      const llmResponse = await fetch("http://127.0.0.1:5000/query-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: `Create a meeting intro for: ${agenda}` })
      });
      const llmData = await llmResponse.json();

      const voiceResponse = await fetch("http://127.0.0.1:5000/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: llmData.response })
      });

      const audioBlob = await voiceResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
      new Audio(audioUrl).play();

    } catch (error) {
      console.error("Error starting the meeting:", error);
    }
  }

  const handleEndMeeting = () => {
    setMeetingStarted(false);
    setTranscript("");
  };

  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col items-center justify-center">
      {!meetingStarted ? (
        <div className="w-4/5 max-w-xl">
          <h1 className="text-6xl font-bold text-center mb-4">ramba.</h1>
          <p className="text-center text-lg mb-8">The AI Agent That Leads Work Meetings</p>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="agenda" className="block text-sm font-medium">
                Meeting Agenda
              </label>
              <input
                type="text"
                id="agenda"
                className="mt-1 w-full px-4 py-2 bg-black text-green-400 border border-green-400 rounded"
                placeholder="Enter agenda"
              />
            </div>
            <div>
              <label htmlFor="documents" className="block text-sm font-medium">
                Relevant Documents
              </label>
              <input
                type="text"
                id="documents"
                className="mt-1 w-full px-4 py-2 bg-black text-green-400 border border-green-400 rounded"
                placeholder="Enter document links"
              />
            </div>
            <div className="h-40 bg-green-900 border-2 border-green-400 rounded flex items-center justify-center">
              <p>Space for an image</p>
            </div>
            <button
              onClick={handleStartMeeting}
              className="w-full px-4 py-2 bg-green-400 text-black font-semibold rounded hover:bg-green-500"
            >
              Create Meeting
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="h-96 bg-green-900 border-2 border-green-400 rounded mb-4 flex items-center justify-center">
            <p>Video Placeholder</p>
          </div>
          <audio controls src={audioSrc}></audio>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-10 px-4 py-2 bg-black text-green-400 border border-green-400 rounded"
            placeholder="Live transcript will appear here..."
          ></textarea>
          <button
            onClick={handleEndMeeting}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
          >
            End Meeting
          </button>
        </div>
      )}
    </div>
  );
}

export default App;