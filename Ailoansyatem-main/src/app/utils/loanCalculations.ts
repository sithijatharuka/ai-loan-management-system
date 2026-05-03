export const calculateMonthlySettlement = (
  loanAmount: number,
  interestRate: number,
  durationMonths: number
): number => {
  const totalInterest = (loanAmount * interestRate * durationMonths) / (100 * 12);
  const totalAmount = loanAmount + totalInterest;
  return totalAmount / durationMonths;
};

export const calculateTotalAmount = (
  loanAmount: number,
  interestRate: number,
  durationMonths: number
): number => {
  const totalInterest = (loanAmount * interestRate * durationMonths) / (100 * 12);
  return loanAmount + totalInterest;
};
