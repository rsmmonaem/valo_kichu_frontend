export const formatAmount = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return '0';

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(parsedAmount)) return '0';

    // Format using 'en-IN' for South Asian numbering system (e.g., 1,00,000) or standard 'en-US'
    // Using 'en-IN' as it's typical for BDT (৳) amounts.
    return parsedAmount.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
    });
};
