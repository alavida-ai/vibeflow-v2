// Generate sample marketing activity data for the past year
export const generateActivityData = () => {
  const data = [];
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    // Generate more realistic activity patterns with fewer empty days
    const random = Math.random();
    let count = 0;
    
    // 80% chance of having some activity (instead of random distribution)
    if (random > 0.2) {
      // Weighted distribution for more realistic activity
      if (random > 0.9) count = Math.floor(Math.random() * 5) + 10; // High activity days
      else if (random > 0.7) count = Math.floor(Math.random() * 5) + 5; // Medium activity days  
      else count = Math.floor(Math.random() * 5) + 1; // Low activity days
    }
    
    // Calculate level based on count (0-4 scale)
    const level = count === 0 ? 0 : Math.min(Math.floor(count / 3) + 1, 4);
    
    data.push({
      date: new Date(d).toISOString().split('T')[0],
      count: count,
      level: level
    });
  }

  return data;
};