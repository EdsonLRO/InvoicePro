const MONEY_SCALE = 100n;
const QUANTITY_SCALE = 1_000n;
const PERCENT_SCALE = 10_000n;
const MAX_MONEY_MINOR = 100_000_000n;
const MAX_QUANTITY = 100_000_000n;

const decimalPattern = /^\d+(?:\.(\d+))?$/;

const parseScaled = (value, decimalPlaces, maximum, label) => {
  const raw = String(value ?? "").trim();
  if (raw.length > 32) throw new Error(`${label} is too large for this free document maker.`);
  const input = raw.startsWith(".") ? `0${raw}` : raw;
  if (!decimalPattern.test(input)) throw new Error(`${label} must be zero or a positive number.`);
  const [whole, fraction = ""] = input.split(".");
  if (fraction.length > decimalPlaces) throw new Error(`${label} can have up to ${decimalPlaces} decimal places.`);
  const scale = 10n ** BigInt(decimalPlaces);
  const result = (BigInt(whole) * scale) + BigInt((fraction + "0".repeat(decimalPlaces)).slice(0, decimalPlaces) || "0");
  if (result > maximum) throw new Error(`${label} is too large for this free document maker.`);
  return result;
};

const roundDivide = (numerator, denominator) => (numerator + (denominator / 2n)) / denominator;

export const parseMoney = (value, label = "Amount") => parseScaled(value, 2, MAX_MONEY_MINOR, label);
export const parseQuantity = (value) => parseScaled(value, 3, MAX_QUANTITY, "Quantity");
export const parsePercent = (value, label = "Percentage") => parseScaled(value, 2, PERCENT_SCALE, label);

export const calculateDocument = ({ items = [], additionalCost = "0", additionalTaxRate = "0" } = {}) => {
  if (!Array.isArray(items) || items.length === 0) throw new Error("Add at least one line item.");
  if (items.length > 50) throw new Error("This free document maker supports up to 50 line items.");

  const lines = items.map((item, index) => {
    const number = index + 1;
    const quantity = parseQuantity(item.quantity ?? "0");
    const unitPrice = parseMoney(item.unitPrice ?? "0", `Unit price on line ${number}`);
    const discountRate = parsePercent(item.discountRate ?? "0", `Discount on line ${number}`);
    const taxRate = parsePercent(item.taxRate ?? "0", `Tax rate on line ${number}`);
    const beforeDiscount = roundDivide(quantity * unitPrice, QUANTITY_SCALE);
    const discount = roundDivide(beforeDiscount * discountRate, PERCENT_SCALE);
    const net = beforeDiscount - discount;
    const tax = roundDivide(net * taxRate, PERCENT_SCALE);
    return { unitPrice, beforeDiscount, discount, net, tax, total: net + tax };
  });

  const extraNet = parseMoney(additionalCost || "0", "Additional cost");
  const extraTaxRate = parsePercent(additionalTaxRate || "0", "Additional-cost tax rate");
  const extraTax = roundDivide(extraNet * extraTaxRate, PERCENT_SCALE);
  const sum = (field) => lines.reduce((total, line) => total + line[field], 0n);
  const subtotal = sum("beforeDiscount");
  const discount = sum("discount");
  const net = sum("net") + extraNet;
  const tax = sum("tax") + extraTax;

  return Object.freeze({
    lines: Object.freeze(lines),
    subtotal,
    discount,
    additionalCost: extraNet,
    net,
    tax,
    total: net + tax
  });
};

export const formatMoney = (minorUnits, currency = "GBP", locale = "en-GB") => {
  const supported = new Set(["GBP", "EUR", "USD"]);
  const code = supported.has(currency) ? currency : "GBP";
  return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(Number(BigInt(minorUnits)) / Number(MONEY_SCALE));
};

export const calculationPolicy = Object.freeze({
  quantityPrecision: 3,
  moneyPrecision: 2,
  percentagePrecision: 2,
  rounding: "half-up-to-minor-unit-per-line",
  taxBasis: "after-line-discount"
});
