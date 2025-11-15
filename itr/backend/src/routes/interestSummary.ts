import express from 'express';
const router = express.Router();

/**
 * POST /api/v1/interest-summary
 * Body:
 * {
 *   fiscalYear: "2024-25",
 *   interest: {
 *     savings: number,
 *     fd: number,
 *     rd: number,
 *     bonds: number,
 *     other: number
 *   },
 *   bankEntries: [
 *     { bankName: string, interest: number, tdsDeducted: number },
 *     ...
 *   ]
 * }
 */
router.post('/', (req, res) => {
  try {
    const { fiscalYear, interest = {}, bankEntries = [] } = req.body;

    // defensive normalisation to numbers
    const getNum = (v: any): number => {
      if (v === undefined || v === null) return 0;
      if (typeof v === 'string') {
        const n = Number(v.replace(/[^0-9.-]+/g, ''));
        return isNaN(n) ? 0 : n;
      }
      return Number(v) || 0;
    };

    const totalInterest = getNum(interest.savings)
      + getNum(interest.fd)
      + getNum(interest.rd)
      + getNum(interest.bonds)
      + getNum(interest.other);

    const totalTDS = bankEntries.reduce((sum: number, b: any) => sum + getNum(b.tdsDeducted), 0);

    // Optional: cross-validate bank interest totals vs category totals and warn if mismatch
    const bankInterestSum = bankEntries.reduce((s: number, b: any) => s + getNum(b.interest), 0);
    const mismatch = Math.abs(bankInterestSum - totalInterest) > 1; // tolerance 1 rupee

    const payload = {
      fiscalYear,
      totalInterest: Math.round(totalInterest),
      totalTDS: Math.round(totalTDS),
      breakdown: {
        categoryInterest: {
          savings: getNum(interest.savings),
          fd: getNum(interest.fd),
          rd: getNum(interest.rd),
          bonds: getNum(interest.bonds),
          other: getNum(interest.other)
        },
        bankSummary: bankEntries.map((b: any) => ({
          bankName: b.bankName || '',
          interest: getNum(b.interest),
          tdsDeducted: getNum(b.tdsDeducted)
        }))
      },
      validation: {
        bankInterestSum,
        categoryInterestSum: totalInterest,
        interestMismatch: mismatch
      }
    };

    // If mismatch, return 200 but include the validation flag for UI to show a gentle warning
    return res.json(payload);
  } catch (err) {
    console.error('Interest summary error', err);
    return res.status(500).json({ error: 'Server error calculating summary' });
  }
});

export default router;
