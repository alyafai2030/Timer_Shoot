import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateStageScore } from '../services/scoreCalculator';
import type { StageData, ShooterScore } from '../types';

const initialStages: StageData[] = Array(5).fill({ time: '', hit: true });

const ScoreEntry: React.FC = () => {
  const { scoreId } = useParams<{ scoreId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(scoreId);

  const [shooterName, setShooterName] = useState('');
  const [stages, setStages] = useState<StageData[]>(initialStages);
  const [savedScores, setSavedScores] = useLocalStorage<ShooterScore[]>('tas-timer-scores', []);

  useEffect(() => {
    if (isEditMode) {
      const scoreToEdit = savedScores.find(s => s.id === scoreId);
      if (scoreToEdit) {
        setShooterName(scoreToEdit.name);
        setStages(scoreToEdit.stages);
      } else {
        console.error("Score not found for editing");
        navigate('/'); // Redirect if score not found
      }
    } else {
      // Reset form when navigating to the new entry page
      setShooterName('');
      setStages(initialStages);
    }
  }, [scoreId, savedScores, navigate]);


  const stageScores = useMemo(() => {
    return stages.map((stage, index) => calculateStageScore(index, stage.time, stage.hit));
  }, [stages]);

  const totalScore = useMemo(() => {
    return stageScores.reduce((sum, score) => sum + score, 0);
  }, [stageScores]);
  
  const isFormValid = useMemo(() => {
    return shooterName.trim() !== '' && stages.every(stage => stage.time.trim() !== '' && !isNaN(parseFloat(stage.time)));
  }, [shooterName, stages]);

  const handleTimeChange = (index: number, value: string) => {
    const oldTime = stages[index].time;

    let sanitizedValue = value.replace(/[^0-9.]/g, '');
    let parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
      parts = sanitizedValue.split('.');
    }
    
    if (oldTime === '' && /^\d$/.test(sanitizedValue) && sanitizedValue.length === 1) {
      sanitizedValue += '.';
    }
    
    if (parts[1] && parts[1].length > 2) {
      sanitizedValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], time: sanitizedValue };
    setStages(newStages);
  };

  const handleHitChange = (index: number, hit: boolean) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], hit: hit };
    setStages(newStages);
  };

  const handleSave = () => {
    if (!isFormValid) return;

    if (isEditMode && scoreId) {
      const updatedScore: ShooterScore = {
        id: scoreId,
        name: shooterName,
        stages: stages,
        totalScore: totalScore,
        date: new Date().toISOString(), // Update date on edit
      };
      setSavedScores(savedScores.map(s => (s.id === scoreId ? updatedScore : s)));
      alert('تم تحديث النتيجة بنجاح!');
      navigate('/results');
    } else {
      const newScore: ShooterScore = {
        id: Date.now().toString(),
        name: shooterName,
        stages: stages,
        totalScore: totalScore,
        date: new Date().toISOString(),
      };
      setSavedScores([...savedScores, newScore]);
      alert(`تم حفظ نتيجة ${shooterName}!`);
      handleReset();
    }
  };
  
  const handleReset = () => {
    setShooterName('');
    setStages(initialStages);
  };
  
  const handleCancelOrReset = () => {
    if (isEditMode) {
      navigate('/results');
    } else {
      handleReset();
    }
  };

  const getScoreColorClass = (score: number): string => {
    if (score === 10) return 'bg-green-500 text-white';
    if (score > 0) return 'bg-amber-500 text-slate-900';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-sky-400">
        {isEditMode ? 'تعديل النتيجة' : 'تسجيل نتائج الرماية'}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="shooterName" className="block text-base md:text-lg font-medium text-slate-300 mb-2">اسم الرامي</label>
        <input
          type="text"
          id="shooterName"
          value={shooterName}
          onChange={(e) => setShooterName(e.target.value)}
          placeholder="أدخل اسم الرامي هنا"
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="hidden md:grid grid-cols-12 gap-2 text-center mb-2 font-bold text-slate-400 text-sm">
        <div className="col-span-2">المرحلة</div>
        <div className="col-span-3">الوقت (ث)</div>
        <div className="col-span-4">الإصابة</div>
        <div className="col-span-3">النقاط</div>
      </div>

      <div className="space-y-2">
        {stages.map((stage, index) => {
          const score = stageScores[index];
          const scoreColorClass = getScoreColorClass(score);

          return (
            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-700/50 p-2 rounded-md">
              <div className="col-span-2 text-center font-bold text-sm sm:text-base">
                <span className="md:hidden">م{index + 1}</span>
                <span className="hidden md:inline">المرحلة {index + 1}</span>
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={stage.time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base"
                />
              </div>
              <div className="col-span-4 grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleHitChange(index, true)}
                  className={`py-2 px-1 rounded-md transition-all text-sm ${stage.hit ? 'bg-green-600 text-white ring-2 ring-white' : 'bg-slate-600 hover:bg-green-700'}`}
                  aria-label="إصابة"
                >
                  <span role="img" aria-hidden="true">✔️</span>
                  <span className="hidden sm:inline"> إصابة</span>
                </button>
                <button
                  onClick={() => handleHitChange(index, false)}
                  className={`py-2 px-1 rounded-md transition-all text-sm ${!stage.hit ? 'bg-red-600 text-white ring-2 ring-white' : 'bg-slate-600 hover:bg-red-700'}`}
                  aria-label="عدم إصابة"
                >
                  <span role="img" aria-hidden="true">❌</span>
                   <span className="hidden sm:inline"> خطأ</span>
                </button>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${scoreColorClass} shadow-lg`}>
                  {score}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center bg-slate-900/70 p-4 rounded-lg">
        <h3 className="text-2xl font-bold text-slate-300">النتيجة الإجمالية</h3>
        <p className="text-5xl font-bold text-sky-400 mt-2">{totalScore} <span className="text-5xl text-slate-400">/ 50</span></p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleSave}
          disabled={!isFormValid}
          className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isEditMode ? 'حفظ التعديلات' : 'حفظ النتيجة'}
        </button>
        <button
          onClick={handleCancelOrReset}
          className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-2 rounded-lg transition-colors"
        >
          {isEditMode ? 'إلغاء' : 'مسح'}
        </button>
      </div>
    </div>
  );
};

export default ScoreEntry;