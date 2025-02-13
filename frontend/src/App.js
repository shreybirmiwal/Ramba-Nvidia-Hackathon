import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function App() {
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");
  const [mode, setMode] = useState("Idle"); // State to track Idle or Speaking mode
  const [documents, setDocuments] = useState("");
  const [llmOut, setllmOut] = useState("")
  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Function to check for the keyword "ramba"
  const checkForKeyword = async () => {
    // Check if the transcript contains "ramba", "rumba", or "rambo"
    if (transcript != null) {
      if (
        transcript.toLowerCase().includes("ramba") ||
        transcript.toLowerCase().includes("rumba") ||
        transcript.toLowerCase().includes("rambo")
      ) {
        console.log("ALERT: 'ramba' detected!");

        //try {
        // 1. Query LLM with meeting documents and ask it to answer
        //const documents = document.getElementById("documents").value || "";
        console.log(documents)

        const llmResponse = await fetch("http://127.0.0.1:5000/query-llm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: ` You are in a meeting acting as an empoyee who's name is Ramba. do not answer with any fluff, just give the short sweet answer and move on, no need to ramble about things.Given the following meeting documents: ${documents}, answer the user's question., ${transcript}`,
          }),
        });

        if (!llmResponse.ok) {
          throw new Error(`LLM API failed with status ${llmResponse.status}`);
        }

        const llmData = await llmResponse.json();
        var res = llmData.response

        console.log("LLM DATA SHOUDL BE HERE ", res)
        console.log(res)
        setllmOut(res)

        // Validate LLM response
        if (!llmData || !llmData.response) {
          throw new Error("Invalid LLM response");
        }

        console.log("LLM Response:", res);

        // 2. Generate voice output for the LLM's response
        const voiceResponse = await fetch("http://127.0.0.1:5000/generate-audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: res }),
        });

        if (!voiceResponse.ok) {
          throw new Error(`Audio API failed with status ${voiceResponse.status}`);
        }

        const audioBlob = await voiceResponse.blob();

        // Validate audio blob
        if (!audioBlob.size) {
          throw new Error("Audio generation failed");
        }

        // Create and play audio
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioSrc(audioUrl);

        // 3. Update mode to Speaking and play the audio
        playAudio(audioUrl);
        // } catch (error) {
        //   console.error("Error handling keyword detection:", error);
        // }

        // Reset the transcript after processing
        resetTranscript();
      }
    }
  };


  // Monitor transcript for changes and check for the keyword
  useEffect(() => {
    checkForKeyword();
  }, [transcript]);

  const handleStartMeeting = async () => {
    setMeetingStarted(true);

    const agenda = document.getElementById("agenda").value;


    try {
      // Fetch LLM response
      const llmResponse = await fetch("http://127.0.0.1:5000/query-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `Do not include any intro or any noise in your input. DO not start with any Llm noise, just give answer. Create a short meeting intro for: ${agenda} `,
        }),
      });

      if (!llmResponse.ok) {
        throw new Error(`LLM API failed with status ${llmResponse.status}`);
      }

      const llmData = await llmResponse.json();


      // Validate LLM response
      if (!llmData || !llmData.response) {
        throw new Error("Invalid LLM response");
      }

      // Fetch audio generation
      const voiceResponse = await fetch("http://127.0.0.1:5000/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: llmData.response }),
      });

      if (!voiceResponse.ok) {
        throw new Error(`Audio API failed with status ${voiceResponse.status}`);
      }

      const audioBlob = await voiceResponse.blob();

      // Validate audio blob
      if (!audioBlob.size) {
        throw new Error("Audio generation failed");
      }

      // Create and play audio
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
      playAudio(audioUrl); // Play the audio and manage mode state
    } catch (error) {
      console.error("Error starting the meeting:", error);
    }
  };

  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    setMode("Speaking"); // Switch to Speaking mode when audio starts playing

    audio.play();

    audio.onended = () => {
      setMode("Idle"); // Switch back to Idle mode when audio ends
    };
  };

  const handleEndMeeting = () => {
    setMeetingStarted(false);
    resetTranscript(); // Reset speech recognition transcript
    setMode("Idle"); // Reset mode to Idle when meeting ends
  };

  // Determine the video source based on the current mode
  const videoSource =
    mode === "Speaking" ? "/speaking.mp4" : "/idle.mp4"; // Replace with actual video paths

  if (!browserSupportsSpeechRecognition) {
    return <div>Your browser does not support speech recognition.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col items-center justify-center">
      {!meetingStarted ? (
        <div className="w-4/5 max-w-xl">
          <h1 className="text-6xl font-bold text-center mb-4">ramba.</h1>
          <p className="text-center text-lg mb-8">
            The AI Agent That Leads Work Meetings
          </p>
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
                value={documents}
                onChange={(e) => setDocuments(e.target.value)}
                className="mt-1 w-full px-4 py-2 bg-black text-green-400 border border-green-400 rounded"
                placeholder="Enter relavent data here"
              />

            </div>
            <img src="banner.png" className=" bg-green-900 border-2 border-green-400 rounded flex items-center justify-center"></img>
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
          {/* Video element that changes based on the mode */}
          <div className="h-96 bg-green-900 border-2 border-green-400 rounded mb-4">
            <video key={videoSource} autoPlay muted loop className="w-full h-full">
              <source src={videoSource} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Audio element */}
          {audioSrc && <audio src={audioSrc} />}

          {/* Transcript area */}
          <textarea
            value={transcript}
            readOnly
            className="w-full h-20 px-4 py-2 bg-black text-green-400 border border-green-400 rounded"
            placeholder="Live transcript will appear here..."
          ></textarea>
          {/* <h1> {llmOut}</h1> */}

          {/* Speech recognition controls */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() =>
                SpeechRecognition.startListening({ continuous: true })
              }
              className={`px-4 py-2 ${listening ? "bg-gray-500" : "bg-green-400"
                } text-black font-semibold rounded hover:bg-green-500`}
            >
              {listening ? "Listening..." : "Start Listening"}
            </button>
            <button
              onClick={SpeechRecognition.stopListening}
              className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500"
            >
              Stop Listening
            </button>
            <button
              onClick={resetTranscript}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
            >
              Reset Transcript
            </button>
          </div>

          {/* End Meeting button */}
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
