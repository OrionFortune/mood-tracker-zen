import React, { useState } from 'react';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError("Salasana on liian lyhyt. Sen täytyy olla vähintään 6 merkkiä.");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Firebase auth error:", err.code);
      
      switch (err.code) {
        case 'auth/invalid-email':
          setError("Sähköpostiosoite on virheellinen.");
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError("Väärä sähköposti tai salasana.");
          break;
        case 'auth/email-already-in-use':
          setError("Tämä sähköposti on jo rekisteröity.");
          break;
        case 'auth/weak-password':
          setError("Salasana on liian heikko.");
          break;
        default:
          setError("Kirjautuminen epäonnistui. Tarkista tiedot.");
      }
    }
  };

  return (
    <div className="nature-bg min-h-screen flex items-center justify-center p-4">
      
      <div className="bg-white/80 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-white/50 animate-in fade-in zoom-in duration-500">
        
        <header className="text-center mb-10">
          <h2 
            className="text-4xl md:text-5xl font-serif mb-3 tracking-tight" 
            style={{ color: '#020617' }}
          >
           {isLogin ? 'Tervetuloa' : 'Luo tili'}
          </h2>
          <p className="text-slate-600 font-medium italic text-sm">
            {isLogin ? 'Jatka mielenrauhan etsimistä' : 'Aloita matkasi tänään'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-4">Sähköposti</label>
            <input
              type="email"
              placeholder="esimerkki@mail.com"
              className="w-full p-4 rounded-2xl bg-white/50 border-2 border-slate-100 focus:border-[#4ADE80] outline-none transition-all text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-4">Salasana</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 rounded-2xl bg-white/50 border-2 border-slate-100 focus:border-[#4ADE80] outline-none transition-all text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50/50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-xl text-center animate-shake">
              {error}
            </div>
          )}

          <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-black active:scale-[0.97] transition-all">
            {isLogin ? 'Kirjaudu sisään' : 'Rekisteröidy'}
          </button>
        </form>

        <footer className="mt-10 pt-6 border-t border-slate-200/50 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); 
            }}
            className="text-[#10B981] font-black text-[11px] uppercase tracking-[0.2em] hover:text-[#059669]"
          >
            {isLogin ? 'Eikö sinulla ole tiliä? Luo uusi' : 'Onko sinulla jo tili? Kirjaudu'}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default Auth;
