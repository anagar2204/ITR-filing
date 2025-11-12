# Tax Rules Engine - FY 2024-25

## Tax Slabs & Rates

### New Tax Regime (Default for FY 2024-25)

| Income Range | Tax Rate | Calculation |
|--------------|----------|-------------|
| ₹0 - ₹3,00,000 | 0% | NIL |
| ₹3,00,001 - ₹7,00,000 | 5% | 5% of (Income - ₹3,00,000) |
| ₹7,00,001 - ₹10,00,000 | 10% | ₹20,000 + 10% of (Income - ₹7,00,000) |
| ₹10,00,001 - ₹12,00,000 | 15% | ₹50,000 + 15% of (Income - ₹10,00,000) |
| ₹12,00,001 - ₹15,00,000 | 20% | ₹80,000 + 20% of (Income - ₹12,00,000) |
| Above ₹15,00,000 | 30% | ₹1,40,000 + 30% of (Income - ₹15,00,000) |

**Rebate under Section 87A**: ₹25,000 (if total income ≤ ₹7,00,000)

**Deductions NOT Allowed**: 80C, 80D, 80E, HRA, LTA, etc.

**Standard Deduction**: ₹50,000 (allowed)

---

### Old Tax Regime

| Income Range | Tax Rate | Calculation |
|--------------|----------|-------------|
| ₹0 - ₹2,50,000 | 0% | NIL |
| ₹2,50,001 - ₹5,00,000 | 5% | 5% of (Income - ₹2,50,000) |
| ₹5,00,001 - ₹10,00,000 | 20% | ₹12,500 + 20% of (Income - ₹5,00,000) |
| Above ₹10,00,000 | 30% | ₹1,12,500 + 30% of (Income - ₹10,00,000) |

**Rebate under Section 87A**: ₹12,500 (if total income ≤ ₹5,00,000)

**Deductions Allowed**: All Chapter VI-A deductions, HRA, LTA, etc.

**Standard Deduction**: ₹50,000

---

### Senior Citizens (60-80 years)

**Old Regime Basic Exemption**: ₹3,00,000

### Super Senior Citizens (80+ years)

**Old Regime Basic Exemption**: ₹5,00,000

---

## Health & Education Cess

4% on Income Tax (applicable to both regimes)

---

## ITR Form Selection Logic

```javascript
function selectITRForm(taxpayer) {
  // ITR-1 (Sahaj)
  if (
    taxpayer.totalIncome <= 5000000 &&
    taxpayer.hasOnlyIncome(['salary', 'onehouse', 'otherincome']) &&
    !taxpayer.hasCapitalGains &&
    !taxpayer.hasBusinessIncome &&
    !taxpayer.hasAssetAbroad
  ) {
    return 'ITR-1';
  }

  // ITR-2
  if (
    !taxpayer.hasBusinessIncome &&
    (taxpayer.hasCapitalGains || 
     taxpayer.hasMultipleHouseProperties ||
     taxpayer.isDirectorOfCompany ||
     taxpayer.hasUnlistedEquityShares ||
     taxpayer.isNRI)
  ) {
    return 'ITR-2';
  }

  // ITR-3
  if (
    taxpayer.hasBusinessIncome &&
    taxpayer.businessType === 'regular' &&
    !taxpayer.eligibleForPresumptive
  ) {
    return 'ITR-3';
  }

  // ITR-4 (Sugam)
  if (
    taxpayer.hasBusinessIncome &&
    taxpayer.eligibleForPresumptive &&
    taxpayer.totalIncome <= 5000000 &&
    (taxpayer.businessTurnover <= 20000000 || 
     taxpayer.professionalIncome <= 5000000)
  ) {
    return 'ITR-4';
  }

  // Default to ITR-2 if unsure
  return 'ITR-2';
}
```

---

## Income Computation

### Salary Income

```
Gross Salary
= Basic Salary + DA + HRA + LTA + Bonus + Other Allowances

Less: Exempt Allowances
- HRA Exemption (if applicable)
- LTA Exemption (if applicable)
- Other exempt allowances

Less: Standard Deduction = ₹50,000

Net Salary = Gross Salary - Exemptions - Standard Deduction
```

#### HRA Exemption Calculation

```
Exempt HRA = Minimum of:
1. Actual HRA received
2. 50% of (Basic + DA) for metro cities, 40% for non-metro
3. Rent paid - 10% of (Basic + DA)
```

### House Property Income

```
Annual Value = Higher of:
- Municipal value
- Fair rent
- Standard rent (if applicable)

Less: Municipal taxes paid

Net Annual Value (NAV)

Less: Standard Deduction = 30% of NAV

Less: Interest on home loan (max ₹2,00,000 for self-occupied)

Income from House Property
```

**Self-Occupied Property**: Annual value = 0, can claim up to ₹2,00,000 interest

**Let-Out Property**: Full annual value considered, no limit on interest

### Capital Gains

#### Equity/Equity Mutual Funds

**Short-Term (held < 12 months)**:
- Tax Rate: 15% (if STT paid)
- Section: 111A

**Long-Term (held ≥ 12 months)**:
- Tax Rate: 10% on gains > ₹1,00,000 (if STT paid)
- Section: 112A
- No indexation benefit

#### Debt Mutual Funds / Bonds

**Short-Term (held < 36 months)**:
- Tax: As per slab rates

**Long-Term (held ≥ 36 months)**:
- Tax Rate: 20% with indexation
- Section: 112

#### Property

**Short-Term (held < 24 months)**:
- Tax: As per slab rates

**Long-Term (held ≥ 24 months)**:
- Tax Rate: 20% with indexation
- Exemptions: Section 54, 54F, 54EC

---

## Deductions (Chapter VI-A)

### Section 80C (Max: ₹1,50,000)
- PPF contributions
- ELSS mutual funds
- Life insurance premium
- NSC
- 5-year bank FD
- Home loan principal repayment
- Tuition fees (2 children)
- Sukanya Samriddhi Yojana
- EPF/VPF contributions

### Section 80CCD(1B) (Max: ₹50,000)
- Additional NPS contribution (over and above 80C)

### Section 80D (Health Insurance)
- Self/Spouse/Children: ₹25,000
- Parents (< 60 years): ₹25,000
- Parents (≥ 60 years): ₹50,000
- Medical check-up: ₹5,000 (within above limits)

### Section 80E
- Interest on education loan (no limit, no time limit)

### Section 80G
- Donations to specified funds/charities
- 50% or 100% deduction based on recipient

### Section 80TTA
- Interest on savings account: ₹10,000 (for individuals < 60 years)

### Section 80TTB
- Interest on deposits: ₹50,000 (for senior citizens)

---

## Presumptive Taxation

### Section 44AD (Business)
- Turnover ≤ ₹2 crores
- Presumptive income: 8% of turnover (6% if digital receipts)
- No need to maintain books

### Section 44ADA (Professionals)
- Gross receipts ≤ ₹50 lakhs
- Presumptive income: 50% of gross receipts
- Applicable: Doctors, lawyers, engineers, architects, CAs, etc.

---

## Validation Rules

### Critical Errors (Must Fix)
1. PAN is mandatory
2. Aadhaar is mandatory (with exceptions)
3. Bank account with IFSC is mandatory
4. Total income mismatch across schedules
5. TDS credit > Total tax payable
6. Invalid ITR form selection
7. Section 80C limit exceeded (₹1,50,000)
8. Duplicate salary entries from same employer

### Warnings (Should Review)
1. TDS in Form 16 ≠ 26AS TDS
2. Large donations without 80G certificate
3. High rent without HRA proof
4. Capital gains without supporting documents
5. Business income but no GST registration (if > ₹20L)

---

## E-Verification Methods

1. **Aadhaar OTP** (most common)
2. **Net Banking** (16 banks supported)
3. **Bank Account** (pre-validated account)
4. **Demat Account** (CDSL/NSDL)
5. **Bank ATM** (generate EVC)
6. **Digital Signature Certificate (DSC)**

---

## Deadlines (FY 2024-25)

| Event | Due Date |
|-------|----------|
| ITR filing (non-audit) | July 31, 2025 |
| ITR filing (audit) | October 31, 2025 |
| Belated return | December 31, 2025 |
| Revised return | December 31, 2025 |
| E-verification | Within 30 days of filing |
| Advance tax Q1 | June 15, 2024 |
| Advance tax Q2 | September 15, 2024 |
| Advance tax Q3 | December 15, 2024 |
| Advance tax Q4 | March 15, 2025 |

---

## Tax Computation Example

### Example 1: Salaried Individual (New Regime)

```
Gross Salary: ₹12,00,000
Standard Deduction: ₹50,000
Net Salary: ₹11,50,000

Tax Calculation:
₹0 - ₹3,00,000: NIL
₹3,00,001 - ₹7,00,000: 5% of ₹4,00,000 = ₹20,000
₹7,00,001 - ₹10,00,000: 10% of ₹3,00,000 = ₹30,000
₹10,00,001 - ₹11,50,000: 15% of ₹1,50,000 = ₹22,500

Total Tax: ₹72,500
Add: Cess (4%): ₹2,900
Tax Payable: ₹75,400
```

### Example 2: Salaried Individual (Old Regime)

```
Gross Salary: ₹12,00,000
Standard Deduction: ₹50,000
Net Salary: ₹11,50,000

Deductions:
80C: ₹1,50,000
80D: ₹25,000
Total Deductions: ₹1,75,000

Taxable Income: ₹11,50,000 - ₹1,75,000 = ₹9,75,000

Tax Calculation:
₹0 - ₹2,50,000: NIL
₹2,50,001 - ₹5,00,000: 5% of ₹2,50,000 = ₹12,500
₹5,00,001 - ₹9,75,000: 20% of ₹4,75,000 = ₹95,000

Total Tax: ₹1,07,500
Add: Cess (4%): ₹4,300
Tax Payable: ₹1,11,800

Recommendation: Choose NEW REGIME (saves ₹36,400)
```

---

## Implementation Notes

1. **Config-Driven**: All tax rates and limits should be in a config file, not hardcoded
2. **Version Control**: Each FY should have its own rule version
3. **Audit Trail**: Log all tax computations for audit purposes
4. **Rounding**: Round tax to nearest rupee (0.50 rounds up)
5. **Negative Income**: House property can have negative income (loss up to ₹2,00,000 adjustable)

---

## API Endpoint Example

```javascript
POST /api/v1/tax-compute/calculate

{
  "financialYear": "2024-25",
  "income": {
    "salary": 1200000,
    "houseProperty": 0,
    "capitalGains": 0,
    "otherIncome": 5000
  },
  "deductions": {
    "80C": 150000,
    "80D": 25000
  },
  "regime": "both"
}

Response:
{
  "old": {
    "totalIncome": 975000,
    "taxBeforeRebate": 107500,
    "cess": 4300,
    "totalTax": 111800
  },
  "new": {
    "totalIncome": 1155000,
    "taxBeforeRebate": 72500,
    "cess": 2900,
    "totalTax": 75400
  },
  "recommendation": "new",
  "savings": 36400
}
```

This tax rules engine forms the core of your tax computation service!
