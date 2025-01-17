import React, { useState } from "react";

function App() {
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleStartMeeting = () => setMeetingStarted(true);
  const handleEndMeeting = () => {
    setMeetingStarted(false);
    setTranscript(""); // Clear the transcript when ending the meeting
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