export function calculateGenericFinancing(
  creditValue: number,
  months: number,
  monthlyRate: number
): { totalPaid: number; totalInterest: number } {
  // Sistema SAC (Tabela de Amortização Constante)
  const constantAmortization = creditValue / months;
  let totalInterest = 0;
  let remainingBalance = creditValue;

  for (let i = 0; i < months; i++) {
    const interest = remainingBalance * monthlyRate;
    totalInterest += interest;
    remainingBalance -= constantAmortization;
  }

  const totalPaid = creditValue + totalInterest;

  return {
    totalPaid,
    totalInterest,
  };
}
