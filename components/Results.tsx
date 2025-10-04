import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { ShooterScore } from '../types';
import { calculateStageScore } from '../services/scoreCalculator';

const Results: React.FC = () => {
  const [scores, setScores] = useLocalStorage<ShooterScore[]>('tas-timer-scores', []);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const sortedScores = [...scores].sort((a, b) => {
    if (sortBy === 'score') {
      return b.totalScore - a.totalScore;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleDelete = (id: string, name: string) => {
    const confirmationMessage = `هل أنت متأكد من حذف نتيجة الرامي "${name}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`;
    if (window.confirm(confirmationMessage)) {
      setScores(scores.filter(score => score.id !== id));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع النتائج المحفوظة؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      setScores([]);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  const handleExportCSV = () => {
    if (scores.length === 0) {
      alert('لا توجد نتائج لتصديرها.');
      return;
    }

    const headers = [
      'الرامي', 'التاريخ', 
      'نقاط م1', 'وقت م1',
      'نقاط م2', 'وقت م2',
      'نقاط م3', 'وقت م3',
      'نقاط م4', 'وقت م4',
      'نقاط م5', 'وقت م5',
      'النتيجة الإجمالية'
    ];
    
    const rows = sortedScores.map(score => {
      const stageDetails = score.stages.flatMap((stage, index) => {
        const stageScore = calculateStageScore(index, stage.time, stage.hit);
        return [stageScore, stage.time];
      });

      return [
        `"${score.name.replace(/"/g, '""')}"`,
        `"${formatDate(score.date)}"`,
        ...stageDetails,
        score.totalScore
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `timing-shooting-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-sky-400">النتائج المحفوظة</h2>
        {scores.length > 0 && (
          <div className="flex flex-wrap gap-2">
             <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              تصدير CSV
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              <span role="img" aria-hidden="true">🗑️</span>
              مسح الكل
            </button>
          </div>
        )}
      </div>

      {scores.length === 0 ? (
        <p className="text-center text-slate-400 text-lg">لا توجد نتائج محفوظة حتى الآن.</p>
      ) : (
        <>
        <div className="flex justify-end gap-4 mb-4">
            <span className="self-center text-slate-300">ترتيب حسب:</span>
            <button 
              onClick={() => setSortBy('date')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sortBy === 'date' ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              الأحدث
            </button>
            <button 
              onClick={() => setSortBy('score')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sortBy === 'score' ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              الأعلى نقاطاً
            </button>
        </div>

        {/* Mobile View: Compact Cards */}
        <div className="space-y-3 md:hidden">
          {sortedScores.map((score) => (
            <div key={score.id} className="bg-slate-700/50 p-3 rounded-lg shadow-md">
               <div className="flex justify-between items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{score.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{formatDate(score.date)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-sky-400">{score.totalScore}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/edit/${score.id}`}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full h-8 w-8 flex items-center justify-center"
                    aria-label={`تعديل نتيجة ${score.name}`}
                  >
                    <span role="img" aria-hidden="true" className="text-base">✏️</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(score.id, score.name)}
                    className="bg-red-700 hover:bg-red-600 text-white p-1.5 rounded-full h-8 w-8 flex items-center justify-center"
                    aria-label={`حذف نتيجة ${score.name}`}
                  >
                    <span role="img" aria-hidden="true" className="text-base">🗑️</span>
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="grid grid-cols-5 gap-1">
                    {score.stages.map((stage, index) => {
                    const stageScore = calculateStageScore(index, stage.time, stage.hit);
                    return (
                        <div key={index} className="text-center bg-slate-800 p-1 rounded-md flex flex-col justify-center">
                            <p className="text-xs font-bold text-slate-400 truncate">م {index + 1}</p>
                            <p className="text-sm font-bold text-sky-400">{stageScore} <span className="text-[10px] text-slate-400">ن</span></p>
                            <p className="text-[11px] font-semibold text-white">{stage.time} ث</p>
                        </div>
                    );
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                    <tr>
                        <th scope="col" className="px-4 py-3">الرامي</th>
                        <th scope="col" className="px-4 py-3">التاريخ</th>
                        {[...Array(5)].map((_, i) => (
                           <th key={i} scope="col" className="px-2 py-3 text-center">المرحلة {i + 1}</th>
                        ))}
                        <th scope="col" className="px-3 py-3 text-center">الإجمالي</th>
                        <th scope="col" className="px-4 py-3 text-center">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedScores.map((score) => (
                        <tr key={score.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{score.name}</td>
                            <td className="px-4 py-3 text-xs">{formatDate(score.date)}</td>
                            {score.stages.map((stage, index) => {
                                const stageScore = calculateStageScore(index, stage.time, stage.hit);
                                return (
                                    <td key={index} className="px-2 py-3 text-center">
                                        <div className="font-bold text-sky-400">{stageScore} ن</div>
                                        <div className="text-xs text-slate-300">{stage.time} ث</div>
                                    </td>
                                );
                            })}
                            <td className="px-3 py-3 text-center font-bold text-lg text-sky-400">{score.totalScore}</td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex justify-center items-center gap-2">
                                    <Link to={`/edit/${score.id}`} className="p-2 rounded-full hover:bg-blue-500/50" aria-label={`تعديل نتيجة ${score.name}`}>
                                      <span role="img" aria-hidden="true" className="text-xl">✏️</span>
                                    </Link>
                                    <button onClick={() => handleDelete(score.id, score.name)} className="p-2 rounded-full hover:bg-red-500/50" aria-label={`حذف نتيجة ${score.name}`}>
                                      <span role="img" aria-hidden="true" className="text-xl">🗑️</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
      )}
    </div>
  );
};

export default Results;
