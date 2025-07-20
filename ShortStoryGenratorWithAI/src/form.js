import React, { useState, useEffect, useRef } from "react";
import { gsap, Expo } from "gsap";
import Prompt from "./components/prompt";
import CircularProgress from "@mui/material/CircularProgress";
import Button from '@mui/material/Button';

// Tarot deck definitions
const SUITS = ["Cups", "Swords", "Wands", "Pentacles"];
const NUMBERS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const COURTS = ["Page", "Knight", "Queen", "King"];
const MINOR_ARCANA = SUITS.flatMap(suit => [
  ...NUMBERS.map(num => ({ name: `${num} of ${suit}`, icon: "fa-solid fa-leaf" })),
  ...COURTS.map(court => ({ name: `${court} of ${suit}`, icon: "fa-solid fa-crown" }))
]);
const MAJOR_ARCANA = [
  { name: "The Fool", icon: "fa-solid fa-star" },
  { name: "The Magician", icon: "fa-solid fa-wand-magic-sparkles" },
  { name: "The High Priestess", icon: "fa-solid fa-moon" },
  { name: "The Empress", icon: "fa-solid fa-crown" },
  { name: "The Emperor", icon: "fa-solid fa-gem" },
  { name: "The Hierophant", icon: "fa-solid fa-chess-bishop" },
  { name: "The Lovers", icon: "fa-solid fa-heart" },
  { name: "The Chariot", icon: "fa-solid fa-horse" },
  { name: "Strength", icon: "fa-solid fa-fist-raised" },
  { name: "The Hermit", icon: "fa-solid fa-user-secret" },
  { name: "Wheel of Fortune", icon: "fa-solid fa-circle-notch" },
  { name: "Justice", icon: "fa-solid fa-scale-balanced" },
  { name: "The Hanged Man", icon: "fa-solid fa-person-falling" },
  { name: "Death", icon: "fa-solid fa-skull" },
  { name: "Temperance", icon: "fa-solid fa-wine-glass" },
  { name: "The Devil", icon: "fa-solid fa-fire" },
  { name: "The Tower", icon: "fa-solid fa-tower-observation" },
  { name: "The Star", icon: "fa-solid fa-star-of-life" },
  { name: "The Moon", icon: "fa-solid fa-moon" },
  { name: "The Sun", icon: "fa-solid fa-sun" },
  { name: "Judgement", icon: "fa-solid fa-trumpet" },
  { name: "The World", icon: "fa-solid fa-globe" }
];
const FULL_DECK = [...MINOR_ARCANA, ...MAJOR_ARCANA];

export default function Form() {
  const backendUrl = "http://localhost:5000";
  const [step, setStep] = useState(0); // 0: greet, 1: ask question, 2: draw cards, 3: show reading
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // {role: 'user'|'bot', text: string}
  const [reading, setReading] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const chatEndRef = useRef(null);

  // Suggestions for common questions
  const suggestions = [
    "What does my career path look like?",
    "Will I be financially successful?",
    "What is coming for my love life?",
    "What should I know about my health?",
    "What is the most important thing I need to know right now?"
  ];

  useEffect(() => {
    if (showGreeting) {
      gsap.fromTo(".greeting-popup", 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      );
    }
  }, [showGreeting]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Draw a random card (no repeats)
  const drawCard = () => {
    if (drawnCards.length >= 3) return;
    let available = FULL_DECK.filter(card => !drawnCards.some(d => d.name === card.name));
    let card = available[Math.floor(Math.random() * available.length)];
    setDrawnCards([...drawnCards, card]);
    // Animate the new card
    setTimeout(() => {
      gsap.fromTo(`.card-${drawnCards.length}`, 
        { scale: 0, rotation: 180 },
        { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    }, 100);
  };

  // Reset the reading
  const resetAll = () => {
    setStep(1); // Go directly to question input panel
    setShowGreeting(false); // Do not show greeting popup again
    setQuestion("");
    setDrawnCards([]);
    setReading("");
    setError(null);
    setLoading(false);
    // Do NOT clear chatHistory, keep previous chats
  };

  // Get tarot reading from backend
  const getTarotReading = async () => {
    setLoading(true);
    setError(null);
    setReading("");
    try {
      const prompt = `User question: ${chatHistory.find(m => m.role === 'user')?.text || ''}. Tarot cards drawn: ${drawnCards.map(c => c.name).join(", ")}. Give a mystical interpretation for Past, Present, and Future.`;
      const response = await fetch(`${backendUrl}/genrateresponse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setReading(data.response);
      setStep(3);
      setChatHistory(prev => [...prev, {role: 'bot', text: data.response}]);
    } catch (err) {
      setError("Error getting tarot reading. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate random stars for background
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const s = [];
    for (let i = 0; i < 80; i++) {
      s.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 2 + 1
      });
    }
    setStars(s);
  }, []);

  // When user clicks Next after entering question, show the draw modal
  const handleNext = () => {
    if (question.trim()) {
      setShowDrawModal(true);
    }
  };

  // When user closes the draw modal, go to step 2 (draw cards)
  const handleCloseDrawModal = () => {
    setShowDrawModal(false);
    setStep(2);
  };

  // New Chat handler
  const handleNewChat = () => {
    setStep(1);
    setShowGreeting(false);
    setQuestion("");
    setDrawnCards([]);
    setReading("");
    setError(null);
    setLoading(false);
    setChatHistory([]);
  };

  return (
    <div className="app-root star-bg">
      <div className="sidebar">
        <div className="sidebar-title">Tarot</div>
        <button className="sidebar-btn" onClick={handleNewChat}>
          <i className="fa-solid fa-plus mr-2"></i> New Chat
        </button>
        <button className="sidebar-btn">
          <i className="fa-solid fa-clock-rotate-left mr-2"></i> Chat History
        </button>
      </div>
      <div className="main-chat-section">
        {/* Animated star background */}
        <div className="stars">
          {stars.map((star, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDuration: `${star.duration}s`
              }}
            />
          ))}
        </div>

        {/* Greeting Popup */}
        {showGreeting && (
          <div className="greeting-popup fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="text-6xl mb-4">🔮</div>
              <h2 className="text-3xl font-bold mb-4 text-purple-800">Welcome to AI Tarot Reader</h2>
              <p className="text-gray-600 mb-6">
                Discover the mystical wisdom of the tarot cards. Ask your question and let the universe guide you through the ancient art of divination.
              </p>
              <button 
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                onClick={() => {
                  setShowGreeting(false);
                  setStep(1);
                }}
              >
                Begin Your Journey ✨
              </button>
            </div>
          </div>
        )}

        <div className="input-field mystical-card-area improved-mystical-box" style={{marginTop: 'auto', marginBottom: 'auto'}}>
          
          {/* Step 1: Ask question */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center mt-8 w-full">
              {/* Chat history area (scrollable) */}
              <div className="chat-history-area">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={msg.role === 'user' ? 'chat-bubble-user mt-4 mb-2' : 'chat-bubble-bot mt-2 mb-2'}>
                    <span>{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {/* Suggestions only on first landing */}
              {chatHistory.filter(m => m.role === 'user').length === 0 && (
                <>
                  <div className="mb-4 flex flex-wrap gap-2 justify-center">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-300 hover:bg-purple-200 transition-colors text-sm"
                        onClick={() => {
                          setChatHistory(prev => [...prev, {role: 'user', text: s}]);
                          setQuestion("");
                          setTimeout(() => {
                            setChatHistory(prev => [...prev, {role: 'bot', text: 'Processing your question...'}]);
                            setTimeout(() => {
                              setChatHistory(prev => [...prev.filter(m => m.text !== 'Processing your question...'), {role: 'bot', text: 'Please draw 3 Tarot Cards for your reading.'}]);
                              setShowDrawModal(true);
                            }, 1000);
                          }, 1000);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🎴</div>
                    <h2 className="text-2xl font-bold text-purple-800">What would you like to know?</h2>
                    <p className="text-gray-600 mt-2">Ask about love, career, health, or any aspect of your life</p>
                  </div>
                </>
              )}
              {/* Input box always visible for chat */}
              <div className="w-2/3 max-w-md mt-4">
                <input
                  className="w-full border-2 border-purple-300 rounded-lg p-4 text-lg focus:border-purple-500 focus:outline-none transition-colors"
                  type="text"
                  placeholder="Type your question here..."
                  value={question}
                  onChange={e => {
                    setQuestion(e.target.value);
                  }}
                  onKeyDown={async e => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const userMsg = e.target.value.trim();
                      setQuestion("");
                      setChatHistory(prev => [...prev, {role: 'user', text: userMsg}]);
                      setTimeout(() => {
                        setChatHistory(prev => [...prev, {role: 'bot', text: 'Processing your question...'}]);
                        setTimeout(() => {
                          setChatHistory(prev => [...prev.filter(m => m.text !== 'Processing your question...'), {role: 'bot', text: 'Please draw 3 Tarot Cards for your reading.'}]);
                          setShowDrawModal(true);
                        }, 1000);
                      }, 1000);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Draw cards */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center mt-8 w-full">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">✨</div>
                <h2 className="text-2xl font-bold text-purple-800">Draw 3 Tarot Cards</h2>
                <p className="text-gray-600 mt-2">Focus on your question and draw three cards for your reading</p>
            </div>

              {/* Card Display Area */}
              <div className="card-row mb-8">
                {drawnCards.map((card, idx) => (
                  <div key={idx} className={`card-${idx} transform transition-all duration-300`}>
                    <Prompt icon={card.icon} text={card.name} para={`Card ${idx+1}`} className="tarot-card" />
                  </div>
                ))}
                {drawnCards.length < 3 && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full h-full border-2 border-dashed border-purple-300 rounded-2xl flex items-center justify-center min-h-[200px]">
                      <button 
                        className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                        onClick={drawCard}
                      >
                        <i className="fa-solid fa-hand-pointer text-2xl"></i>
                      </button>
                    </div>
                    <p className="mt-2 text-gray-600">Click to draw</p>
                  </div>
                )}
            </div>

              {drawnCards.length === 3 && (
                <div className="text-center">
                  <button 
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    onClick={getTarotReading} 
                    disabled={loading}
                  >
                    <i className="fa-solid fa-crystal-ball mr-2"></i>
                    {loading ? "Reading the Cards..." : "Get Your Reading"}
                  </button>
                </div>
              )}
              
              <button 
                className="mt-4 text-purple-600 hover:text-purple-800 transition-colors"
                onClick={resetAll}
              >
                <i className="fa-solid fa-rotate-left mr-2"></i>
                Start Over
              </button>
            </div>
          )}
        </div>

        {/* Draw Cards Modal */}
        {showDrawModal && (
          <div className="draw-modal-overlay">
            <div className="draw-modal-box">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">✨</div>
                <h2 className="text-2xl font-bold text-purple-800">Draw 3 Tarot Cards</h2>
                <p className="text-gray-600 mt-2">Focus on your question and draw three cards for your reading</p>
              </div>
              <button
                className="close-modal-btn"
                onClick={handleCloseDrawModal}
              >
                <i className="fa-solid fa-check mr-2"></i>Start Drawing
      </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-animation absolute left-[48%] top-[50%] z-10 w-25 h-1 0">
            <CircularProgress color="secondary" size="5vw" />
          </div>
        )}

        {step === 3 && reading && !loading && (
          <div className="generated-story">
            <div className="story-frame z-10 absolute border-[grey] border-[1px] w-[50%] left-[25%] top-[22%] rounded-l-3xl p-8 font-bold font-serif h-[65%] overflow-y-scroll">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🔮</div>
                <h2 className="text-2xl font-bold text-purple-800">Your Tarot Reading</h2>
              </div>
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <p className="font-semibold text-purple-800">Question:</p>
                <p className="italic">{question}</p>
              </div>
              <div className="flex flex-row gap-4 mb-6 justify-center">
                {drawnCards.map((card, idx) => (
                  <div key={idx} className="transform scale-75">
                    <Prompt icon={card.icon} text={card.name} para={`Card ${idx+1}`} />
          </div>
              ))}
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
              <p className="leading-relaxed">{reading}</p>
          </div>
            <div className="text-center mt-6">
              <button
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                onClick={resetAll}
              >
                <i className="fa-solid fa-rotate-left mr-2"></i>
                New Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="error absolute z-[11] top-[20%] left-[23%] w-[58%]">
          <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 ">
            <div className="text-center">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-base font-semibold text-[#57CACA]">Error</p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Tarot Reading Error
              </h1>
              <p className="mt-6 text-base leading-7 text-gray-600">
                {error}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={resetAll}
                  className="rounded-md bg-[#57CACA] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#C37979] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-[3000]"
                >
                  Start Over
                </button>
              </div>
            </div>
          </main>
        </div>
      )}
      {/* Vignette overlay */}
      <div className="vignette"></div>
    </div>
  </div>
);
}
