
import React, { useState, useEffect, useCallback } from 'react';
import { generateQuestion } from './services/geminiService';
import { Question, GameStatus, GameState, LeaderboardEntry } from './types';
import { Button } from './components/Button';
import { OptionCard } from './components/OptionCard';
import { 
  HelpCircle, 
  SkipForward, 
  Trophy, 
  RotateCcw, 
  Zap, 
  Info, 
  Loader2, 
  User, 
  ListOrdered, 
  ArrowLeft, 
  ChevronRight,
  Home,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const INITIAL_STATE: GameState = {
  playerName: '',
  currentQuestion: null,
  score: 0,
  level: 1,
  skipsLeft: 3,
  hintUsedForCurrent: false,
  status: GameStatus.START,
  isLoading: false,
  lastError: null
};

const MONEY_LEVELS = [
  '1.000', '2.000', '3.000', '5.000', '10.000', 
  '20.000', '40.000', '80.000', '150.000', '250.000', 
  '500.000', '1.000.000'
];

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('english_quiz_leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  const saveScore = (finalState: GameState) => {
    const newEntry: LeaderboardEntry = {
      name: finalState.playerName || 'Anônimo',
      score: finalState.score,
      level: finalState.level,
      date: new Date().toLocaleDateString('pt-BR')
    };
    const updated = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(updated);
    localStorage.setItem('english_quiz_leaderboard', JSON.stringify(updated));
  };

  const fetchNextQuestion = useCallback(async (currentLevel: number) => {
    setGame(prev => ({ ...prev, isLoading: true, lastError: null }));
    try {
      const q = await generateQuestion(currentLevel);
      setGame(prev => ({ 
        ...prev, 
        currentQuestion: q, 
        isLoading: false,
        status: GameStatus.PLAYING,
        hintUsedForCurrent: false
      }));
      setSelectedIdx(null);
      setRevealed(false);
      setShowHint(false);
      setShowExplanation(false);
    } catch (err: any) {
      setGame(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastError: err.message || "Ocorreu um erro ao conectar com a IA."
      }));
    }
  }, []);

  const startGame = () => {
    if (!game.playerName.trim()) return;
    setGame(prev => ({ ...INITIAL_STATE, playerName: prev.playerName }));
    fetchNextQuestion(1);
  };

  const handleAnswer = (idx: number) => {
    if (revealed || !game.currentQuestion) return;
    setSelectedIdx(idx);
    
    setTimeout(() => {
      setRevealed(true);
      const isCorrect = idx === game.currentQuestion?.correctIndex;
      
      setTimeout(() => {
        if (isCorrect) {
          const prizeAmount = parseInt(MONEY_LEVELS[game.level - 1].replace('.', ''));
          setGame(prev => ({ 
            ...prev, 
            score: prev.score + prizeAmount
          }));
          setShowExplanation(true);
        } else {
          const finalState = { ...game, status: GameStatus.GAMEOVER };
          setGame(finalState);
          saveScore(finalState);
        }
      }, 1000);
    }, 800);
  };

  const nextLevel = () => {
    const nextLvl = game.level + 1;
    if (game.level === MONEY_LEVELS.length) {
       const finalState = { ...game, status: GameStatus.WIN };
       setGame(finalState);
       saveScore(finalState);
       return;
    }
    setGame(prev => ({ ...prev, level: nextLvl }));
    fetchNextQuestion(nextLvl);
  };

  const handleSkip = () => {
    if (game.skipsLeft > 0 && !revealed) {
      setGame(prev => ({ ...prev, skipsLeft: prev.skipsLeft - 1 }));
      fetchNextQuestion(game.level);
    }
  };

  const handleHint = () => {
    if (!game.hintUsedForCurrent) {
      setShowHint(true);
      setGame(prev => ({ ...prev, hintUsedForCurrent: true }));
    }
  };

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in zoom-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-blue-500/20 rounded-full animate-pulse"></div>
        <h1 className="text-6xl md:text-8xl font-black text-yellow-400 font-show italic uppercase tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
          Show do<br/><span className="text-white">Inglês</span>
        </h1>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
          <input 
            type="text" 
            placeholder="Seu nome aqui..."
            className="w-full bg-blue-900/40 border-2 border-blue-500/50 rounded-full py-3 pl-12 pr-6 text-white placeholder:text-blue-500 focus:outline-none focus:border-yellow-400 transition-all text-lg"
            value={game.playerName}
            onChange={(e) => setGame(prev => ({ ...prev, playerName: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={startGame} disabled={!game.playerName.trim()} className="w-full">
            <Zap className="fill-current" /> COMEÇAR JOGO
          </Button>
          <Button variant="outline" onClick={() => setGame(prev => ({ ...prev, status: GameStatus.LEADERBOARD }))} className="w-full">
            <ListOrdered size={20} /> VER PLACAR
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <Loader2 className="w-16 h-16 text-yellow-400 animate-spin" />
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Preparando Pergunta...</h2>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => setGame(prev => ({ ...prev, status: GameStatus.START }))} className="p-2 hover:bg-white/10 rounded-full transition-colors text-yellow-400">
          <ArrowLeft size={32} />
        </button>
        <h2 className="text-3xl font-black text-yellow-400 font-show italic uppercase">Líderes</h2>
      </div>

      <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-blue-800/50 border-b border-blue-500/30">
            <tr>
              <th className="px-4 py-3 font-bold text-blue-300 uppercase">#</th>
              <th className="px-4 py-3 font-bold text-blue-300 uppercase">Jogador</th>
              <th className="px-4 py-3 font-bold text-blue-300 uppercase">Nível</th>
              <th className="px-4 py-3 font-bold text-blue-300 uppercase text-right">Prêmio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500/10">
            {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-400 text-blue-900' : 'bg-blue-800 text-white'}`}>
                    {i + 1}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">{entry.name}</td>
                <td className="px-4 py-3 text-blue-300">Lvl {entry.level}</td>
                <td className="px-4 py-3 text-right font-black text-yellow-400">R$ {entry.score.toLocaleString('pt-BR')}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-blue-400 italic">Nenhum recorde ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPlayScreen = () => {
    if (!game.currentQuestion) return null;

    return (
      <div className="max-w-4xl mx-auto space-y-4 pt-4 px-2">
        {/* Compact Header Stats */}
        <div className="flex flex-row items-center justify-between bg-blue-900/40 px-4 py-2 rounded-xl border border-blue-500/30 backdrop-blur-sm shadow-md text-xs">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-yellow-400" />
            <span className="font-bold text-white whitespace-nowrap">R$ {MONEY_LEVELS[game.level - 1]}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-5 h-5 rounded-full border border-blue-900 flex items-center justify-center transition-colors
                ${i < game.skipsLeft ? 'bg-yellow-400 text-blue-900' : 'bg-blue-800/40 text-blue-400'}`}>
                <SkipForward size={8} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-yellow-400">NÍVEL {game.level}/12</span>
            <div className="w-12 h-1.5 bg-blue-900 rounded-full overflow-hidden border border-blue-500/30 hidden xs:block">
              <div 
                className="h-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)]" 
                style={{ width: `${(game.level / MONEY_LEVELS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {!showExplanation ? (
          /* Question View */
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-900 to-blue-950 p-6 rounded-2xl border border-blue-400/30 shadow-xl relative overflow-hidden animate-in fade-in duration-300">
              <h2 className="text-xl md:text-2xl font-bold leading-tight mb-6">
                {game.currentQuestion.question}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {game.currentQuestion.options.map((option, idx) => (
                  <OptionCard
                    key={idx}
                    index={idx}
                    text={option}
                    onClick={() => handleAnswer(idx)}
                    disabled={revealed || selectedIdx !== null}
                    state={
                      revealed 
                        ? (idx === game.currentQuestion?.correctIndex ? 'correct' : (selectedIdx === idx ? 'wrong' : 'idle'))
                        : (selectedIdx === idx ? 'selected' : 'idle')
                    }
                  />
                ))}
              </div>

              {showHint && (
                <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/40 rounded-lg flex gap-2 items-start animate-in slide-in-from-bottom-2 duration-300">
                  <Info size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-100"><span className="font-bold text-yellow-400 uppercase mr-1">Dica:</span> {game.currentQuestion.hint}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 py-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleHint} 
                disabled={game.hintUsedForCurrent || revealed}
                className="flex-1 max-w-[150px]"
              >
                <HelpCircle size={14} /> Dica
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSkip} 
                disabled={game.skipsLeft === 0 || revealed}
                className="flex-1 max-w-[150px]"
              >
                <SkipForward size={14} /> Pular ({game.skipsLeft})
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => {
                  const finalState = { ...game, status: GameStatus.GAMEOVER };
                  setGame(finalState);
                  saveScore(finalState);
                }} 
                disabled={revealed}
                className="flex-1 max-w-[150px]"
              >
                Parar
              </Button>
            </div>
          </div>
        ) : (
          /* Explanation View */
          <div className="bg-blue-900/50 p-8 rounded-3xl border-2 border-green-500/40 shadow-2xl animate-in zoom-in duration-500 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-green-400 uppercase italic">Resposta Correta!</h3>
              <p className="text-blue-100 text-lg leading-relaxed max-w-lg">
                {game.currentQuestion.explanation}
              </p>
            </div>

            <div className="pt-4 w-full">
              <Button 
                size="lg" 
                onClick={nextLevel} 
                className="w-full max-w-sm mx-auto shadow-[0_0_20px_rgba(250,204,21,0.3)] animate-bounce"
              >
                {game.level === MONEY_LEVELS.length ? 'VER MEU PRÊMIO' : 'PRÓXIMO NÍVEL'} <ChevronRight size={24} />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEndScreen = (status: GameStatus) => {
    const isWin = status === GameStatus.WIN;
    const prizeIndex = Math.max(0, game.level - 2);
    const prizeWon = isWin ? "1.000.000" : (game.level > 1 ? MONEY_LEVELS[prizeIndex] : "0");

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in zoom-in duration-700 px-4">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isWin ? 'bg-yellow-400 text-blue-900 shadow-xl' : 'bg-red-600 text-white shadow-xl'}`}>
          {isWin ? <Trophy size={48} /> : <XCircle size={48} />}
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase italic font-show">
            {isWin ? 'VOCÊ GANHOU!' : 'FIM DE JOGO'}
          </h2>
          <p className="text-xl text-blue-200">
            {game.playerName}, você chegou ao Nível {game.level}
          </p>
          <div className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-xl inline-block mt-2 shadow-lg border-2 border-yellow-200">
            <p className="text-[10px] uppercase font-black">Prêmio Final</p>
            <p className="text-4xl font-black">R$ {prizeWon}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button size="md" onClick={startGame} className="w-full">
            <RotateCcw size={18} /> NOVO JOGO
          </Button>
          <Button variant="outline" size="md" onClick={() => setGame(prev => ({ ...prev, status: GameStatus.LEADERBOARD }))} className="w-full">
            PLACAR
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#000b2e] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950 to-black text-white selection:bg-yellow-400 selection:text-blue-900 overflow-x-hidden">
      <header className="py-3 px-4 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
        <div 
          className="flex items-center gap-2 group cursor-pointer" 
          onClick={() => setGame(prev => ({...prev, status: GameStatus.START}))}
        >
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-blue-900 shadow-md transform group-hover:scale-105 transition-all">
            <Home size={18} strokeWidth={3} />
          </div>
          <span className="text-lg font-black font-show italic tracking-tighter">SHOW DO INGLÊS</span>
        </div>
        <div className="px-3 py-1 bg-blue-900/50 rounded-full border border-blue-400/30 text-[9px] uppercase font-black text-blue-300 tracking-widest">
          LEVEL UP SYSTEM
        </div>
      </header>

      <main className="container mx-auto px-2 max-w-4xl pb-4">
        {game.isLoading ? renderLoading() : (
          <>
            {game.status === GameStatus.START && renderStartScreen()}
            {game.status === GameStatus.PLAYING && renderPlayScreen()}
            {game.status === GameStatus.LEADERBOARD && renderLeaderboard()}
            {(game.status === GameStatus.GAMEOVER || game.status === GameStatus.WIN) && renderEndScreen(game.status)}
          </>
        )}

        {game.lastError && (
          <div className="mt-4 p-4 bg-red-600/20 border border-red-500 rounded-xl text-center max-w-md mx-auto shadow-lg">
            <p className="text-red-400 font-bold mb-1 text-xs uppercase">Erro</p>
            <p className="text-white text-sm mb-4 leading-snug">{game.lastError}</p>
            <Button variant="danger" size="sm" onClick={() => fetchNextQuestion(game.level)} className="w-full">
              Tentar Novamente
            </Button>
          </div>
        )}
      </main>

      {game.status === GameStatus.START && (
        <footer className="fixed bottom-0 w-full py-4 text-center text-blue-500/20 text-[10px]">
          <p>&copy; 2024 SHOW DO INGLÊS. POWERED BY AI.</p>
        </footer>
      )}
    </div>
  );
};

export default App;
