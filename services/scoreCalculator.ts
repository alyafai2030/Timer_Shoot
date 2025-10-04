
export const calculateStageScore = (stageIndex: number, timeStr: string, hit: boolean): number => {
  if (!hit || timeStr === '' || isNaN(parseFloat(timeStr))) {
    return 0;
  }

  const time = parseFloat(timeStr);

  // Use integer arithmetic by converting time to hundredths of a second to avoid floating-point inaccuracies.
  const timeInHundredths = Math.round(time * 100);

  // Stages 1, 3, 5 (indices 0, 2, 4)
  if (stageIndex === 0 || stageIndex === 2 || stageIndex === 4) {
    if (timeInHundredths <= 304) return 10;
    // For every 0.05s (5 hundredths) over the 3.04s threshold, a point is deducted.
    // Math.ceil ensures that as soon as the time exceeds the threshold, a penalty is applied.
    // e.g., 3.05s (305 hundredths): ceil((305 - 304) / 5) = ceil(0.2) = 1 penalty point.
    const penalty = Math.ceil((timeInHundredths - 304) / 5);
    return Math.max(0, 10 - penalty);
  }

  // Stages 2, 4 (indices 1, 3)
  if (stageIndex === 1 || stageIndex === 3) {
    if (timeInHundredths <= 509) return 10;
    // For every 0.10s (10 hundredths) over the 5.09s threshold, a point is deducted.
    // e.g., 5.10s (510 hundredths): ceil((510 - 509) / 10) = ceil(0.1) = 1 penalty point.
    const penalty = Math.ceil((timeInHundredths - 509) / 10);
    return Math.max(0, 10 - penalty);
  }

  return 0;
};
