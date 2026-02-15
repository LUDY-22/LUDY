
export const formatCurrency = (value: number): string => {
  // Formato: Kz 10.000,00
  return "Kz " + value.toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
