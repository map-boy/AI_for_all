import { useState, useEffect, useRef } from 'react';
import { MapPin, Mic, Search, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const RwandaTour = () => {
  const [query, setQuery]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [chat, setChat]               = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const recognitionRef                = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous     = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang           = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsRecording(false);
        handleSearch(transcript);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend   = () => setIsRecording(false);
    }
  }, []);

  // TTS — calls backend which calls Gemini
  const speak = async (text: string) => {
    setIsSpeaking(true);
    try {
      const res = await fetch('http://localhost:3001/api/ai/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error('TTS Error:', e);
      setIsSpeaking(false);
    }
  };

  // Search — calls backend which calls Gemini
  const handleSearch = async (overrideQuery?: string) => {
    const finalQuery = overrideQuery || query;
    if (!finalQuery) return;
    setLoading(true);
    setChat(prev => [...prev, { role: 'user', text: finalQuery }]);
    setQuery('');

    try {
      const res = await fetch('http://localhost:3001/api/ai/rwanda-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChat(prev => [...prev, { role: 'ai', ...data }]);
      speak(data.answer);
    } catch (e: any) {
      console.error('Tour Error:', e);
      setChat(prev => [...prev, { role: 'ai', answer: e.message || 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) { recognitionRef.current?.stop(); }
    else { setIsRecording(true); recognitionRef.current?.start(); }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] flex flex-col px-2">
      <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-2 md:pr-4 mb-4 md:mb-6 scrollbar-hide">
        {chat.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 opacity-50">
            <MapPin className="w-12 h-12 md:w-16 md:h-16" />
            <div>
              <h3 className="text-xl md:text-2xl font-bold">Rwanda AI Guide</h3>
              <p className="text-xs md:text-sm px-4">Ask about local communities, expat groups, or trending news.</p>
            </div>
          </div>
        )}
        {chat.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[90%] md:max-w-[80%] p-4 md:p-6 rounded-2xl md:rounded-3xl', msg.role === 'user' ? 'bg-blue-500 text-white' : 'glass border border-white/10')}>
              {msg.role === 'ai' ? (
                <div className="space-y-3 md:space-y-4">
                  <p className="text-sm md:text-lg leading-relaxed">{msg.answer}</p>
                  {msg.english_answer && msg.english_answer !== msg.answer && (
                    <p className="text-[10px] md:text-sm text-white/40 italic">Eng: {msg.english_answer}</p>
                  )}
                  <div className="pt-3 md:pt-4 border-t border-white/10 flex items-center gap-3 md:gap-4 text-[10px] md:text-sm text-white/40">
                    <button onClick={() => speak(msg.answer)} className={cn('flex items-center gap-1 hover:text-white transition-colors', isSpeaking && 'text-blue-400')}>
                      <Mic className={cn('w-3 h-3 md:w-4 md:h-4', isSpeaking && 'animate-pulse')} /> Listen
                    </button>
                    <span className="flex items-center gap-1"><Search className="w-3 h-3 md:w-4 md:h-4" /> Grounded Source</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm md:text-lg">{msg.text}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative pb-4 md:pb-0 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask anything or use the mic..."
            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 pl-4 md:pl-6 pr-16 md:pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm md:text-lg"
          />
          <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={toggleRecording}
              className={cn('p-2 md:p-3 rounded-lg md:rounded-xl transition-all', isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white/40 hover:text-white')}
            >
              <Mic className="w-4 h-4 md:w-6 md:h-6" />
            </button>
            <button onClick={() => handleSearch()} disabled={loading} className="bg-blue-500 hover:bg-blue-400 p-3 md:p-4 rounded-lg md:rounded-xl transition-all">
              {loading
                ? <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RwandaTour;