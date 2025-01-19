type Period = 'YTD' | 'QTD' | 'MTD'

// Create a deterministic random number generator
export function createDeterministicRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return function() {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

export function generateMockData(period: Period) {
  const random = createDeterministicRandom(period);
  
  const randomInt = (min: number, max: number) => 
    Math.floor(random() * (max - min + 1) + min);
  
  const randomFloat = (min: number, max: number) => 
    parseFloat((random() * (max - min) + min).toFixed(2));

  const generateMonthlyData = (numMonths: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({ length: numMonths }, (_, i) => ({
      month: months[i],
      revenue: randomInt(400000, 700000),
      income: randomInt(40000, 70000),
      expenses: randomInt(30000, 60000)
    }));
  };

  const monthsInPeriod = period === 'YTD' ? 12 : period === 'QTD' ? 3 : 1;
  const monthlyData = generateMonthlyData(monthsInPeriod);

  return {
    revenueData: monthlyData,
    incomeStatementData: monthlyData,
    metrics: {
      totalRevenue: monthlyData.reduce((sum, month) => sum + month.revenue, 0),
      netIncome: monthlyData.reduce((sum, month) => sum + month.income - month.expenses, 0),
      cashOnHand: randomInt(100000, 200000),
      expenseRatio: randomFloat(0.6, 0.9)
    }
  };
}

