export interface FinancingResult {
  totalPaid: number;
  totalInterest: number;
  firstInstallment: number;
  lastInstallment: number;
  monthlyRate: number;
  installments: number[];
}

export function calculateGenericFinancing(
  creditValue: number,
  months: number,
  monthlyRate: number = 0.012
): FinancingResult {
  const constantAmortization = creditValue / months;
  const installments: number[] = [];

  for (let i = 1; i <= months; i++) {
    const remainingBalance = creditValue - constantAmortization * (i - 1);
    const interest = remainingBalance * monthlyRate;
    const installment = constantAmortization + interest;
    installments.push(installment);
  }

  const totalPaid = installments.reduce((sum, inst) => sum + inst, 0);
  const totalInterest = totalPaid - creditValue;

  return {
    totalPaid,
    totalInterest,
    firstInstallment: installments[0],
    lastInstallment: installments[months - 1],
    monthlyRate,
    installments,
  };
}
