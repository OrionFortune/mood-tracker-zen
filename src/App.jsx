import React, { useState, useEffect, useRef, useMemo } from 'react';
import { moodData } from './data';
import { saveMood, auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import Auth from './Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendation, setRecommendation] = useState({ quote: '', author: '', book: null });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(new Audio('/lofi-relax.mp3'));
  const petals = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 20}%`,
      duration: `${10 + Math.random() * 15}s`,
      delay: `${Math.random() * 10}s`
    })), []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      unsubscribeAuth();
      audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "moods"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(docs);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribeHistory();
  }, [user]);

  const toggleMusic = () => {
    if (isMuted) {
      audioRef.current.play().catch(err => console.log("Playback blocked"));
    } else {
      audioRef.current.pause();
    }
    setIsMuted(!isMuted);
  };

  const getRecommendation = async (mood) => {
    setLoading(true);
    setSelectedMood(mood);
    const moodBooks = moodData[mood]?.books || [];
    const randomBook = moodBooks[Math.floor(Math.random() * moodBooks.length)];
    
    try {
      const response = await fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent('https://zenquotes.io/api/random')}`);
      const data = await response.json();
      setRecommendation({ 
        quote: data[0]?.q || "Hengitä syvään. Kaikki on hyvin.", 
        author: data[0]?.a || "Mielenrauha", 
        book: randomBook 
      });
    } catch (error) {
      setRecommendation({ quote: "Hengitä syvään. Kaikki on hyvin.", author: "Mielenrauha", book: randomBook });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMood || !recommendation.quote || !recommendation.book) return;
    setSaving(true);
    try {
      await saveMood({
        userId: user.uid, 
        mood: selectedMood,
        label: moodData[selectedMood].label,
        quote: recommendation.quote,
        author: recommendation.author,
        book: recommendation.book.title,
        createdAt: new Date()
      });
    } catch (error) {
      alert("Virhe tallennuksessa.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return (
    <div className="nature-bg h-screen w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#10B981] border-t-transparent"></div>
    </div>
  );

  if (!user) return <Auth />;

  return (
    <div className="nature-bg min-h-screen w-full text-[#2D2D2D] relative overflow-x-hidden">
      
      {petals.map((p) => (
        <div 
          key={p.id} 
          className="petal" 
          style={{ 
            left: p.left, 
            top: p.top, 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#ffd1dc', 
            borderRadius: '50% 0 50% 50%', 
            opacity: 0.6, 
            animationDuration: p.duration, 
            animationDelay: p.delay 
          }} 
        />
      ))}

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 flex flex-col items-center text-center">
        
        <div className="flex justify-center gap-3 mb-8">
          <button onClick={toggleMusic} className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-700 hover:bg-white transition-all border border-white/40 shadow-sm">
            {isMuted ? '🔈 Ääni pois' : '🔊 Musiikki päällä'}
          </button>
          <button onClick={() => signOut(auth)} className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-700 hover:bg-white transition-all border border-white/40 shadow-sm">
            Kirjaudu ulos
          </button>
        </div>

        <header className="mb-8">
          <h1 className="text-6xl md:text-7xl font-serif mb-3 tracking-tighter drop-shadow-sm" style={{ color: '#0f172a' }}>Mielenrauha</h1>
          <p className="text-slate-600 text-xl font-medium italic">Miltä sinusta tuntuu, {user.email?.split('@')[0]}?</p>
        </header>

        <div className="grid grid-cols-3 gap-3 mb-8 w-full">
          {Object.entries(moodData).map(([key, data]) => (
            <button key={key} onClick={() => getRecommendation(key)} disabled={loading || saving} className={`p-3 rounded-3xl transition-all duration-500 border-2 flex flex-col items-center justify-center min-h-[100px] backdrop-blur-sm ${selectedMood === key ? 'bg-white border-[#4ADE80] shadow-xl scale-105' : 'bg-white/40 border-white/20 hover:bg-white/60'}`}>
              <span className="text-3xl mb-1">{data.emoji}</span>
              <span className="text-[9px] uppercase tracking-widest font-black text-[#1E293B]">{data.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recommendation.quote && (
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white animate-in zoom-in-95 duration-500 mb-12 w-full">
            <blockquote className="mb-6 font-serif italic text-xl text-slate-900 leading-relaxed">"{recommendation.quote}"</blockquote>
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-lg font-serif text-slate-900">{recommendation.book?.title}</h3>
              <p className="text-[#10B981] font-bold text-sm">{recommendation.book?.author}</p>
            </div>
            <button onClick={handleSave} disabled={saving} className="mt-8 w-full py-4 bg-[#10B981] text-white rounded-2xl hover:bg-[#059669] transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg disabled:opacity-50">
              {saving ? 'TALLENNETAAN...' : 'Tallenna päiväkirjaan'}
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-12 text-left animate-in fade-in slide-in-from-bottom-4 duration-1000 w-full">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-6 ml-4">Viimeisimmät merkinnät</h2>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/50 flex items-center gap-4 hover:bg-white/60 transition-all">
                  <span className="text-2xl">{moodData[item.mood]?.emoji || '📜'}</span>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      {item.createdAt?.toDate?.() ? item.createdAt.toDate().toLocaleDateString('fi-FI') : '---'}
                    </p>
                    <p className="text-sm font-serif italic text-slate-800 line-clamp-1">"{item.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;