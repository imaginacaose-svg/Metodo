export interface FinancingResult {
  totalPaid: number;
  totalInterest: number;
  firstInstallment: number;
  lastInstallment: number;
  monthlyRate: number;
  annualRate: number;
  installments: number[];
}

// Taxas reais do mercado brasileiro (2026)
// Imobiliário: 11,40% a.a. = 0,95% a.m.
// Veículos: 26% a.a. = 1,9% a.m.
export const MARKET_RATES = {
  imobiliario: {
    monthly: 0.0095, // 0,95% ao mês
    annual: 11.40,   // 11,40% ao ano
    label: '11,40% a.a.'
  },
  automovel: {
    monthly: 0.019,  // 1,9% ao mês
    annual: 26,      // 26% ao ano
    label: '26% a.a.'
  }
};

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
    annualRate: monthlyRate * 12,
    installments,
  };
}
