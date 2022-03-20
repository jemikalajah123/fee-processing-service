const checkLocale = (currencyCountry, country) => {
  if (currencyCountry === country) {
    return "LOCL";
  }
  return "INTL";
};

const applyConfiguration = (configuration, amount, bearsFee) => {
  let appliedFee = 0;
  switch (configuration.feeType) {
    case "FLAT_PERC":
      let feeValues = configuration.feeValue.split(":");
      appliedFee = getAppliedFee(
        Number(amount),
        Number(feeValues[1]),
        Number(feeValues[0])
      );
      break;
    case "PERC":
      appliedFee = getAppliedFee(
        (amount = Number(amount)),
        (value = Number(configuration.feeValue))
      );
      break;

    case "FLAT":
      appliedFee = getAppliedFee(
        (amount = Number(amount)),
        (flatValue = Number(configuration.feeValue))
      );
      break;

    default:
      break;
  }
  let chargeAmount = getChargeAmount(Number(amount), appliedFee, bearsFee);
  let settlementAmount = getSettlementAmount(chargeAmount, appliedFee);
  return {
    AppliedFeeID: configuration.feeId,
    AppliedFeeValue: appliedFee,
    ChargeAmount: chargeAmount,
    SettlementAmount: settlementAmount,
  };
};

const getAppliedFee = (amount, value = 0, flatValue = 0) => {
  return Math.ceil(flatValue + (value / 100) * amount);
};

const getChargeAmount = (amount, appliedFeeValue, bearsFee) => {
  return bearsFee ? amount + appliedFeeValue : amount;
};

const getSettlementAmount = (chargeAmount, appliedFeeValue) => {
  return chargeAmount - appliedFeeValue;
};

module.exports = {
  checkLocale,
  getAppliedFee,
  getSettlementAmount,
  getChargeAmount,
  applyConfiguration,
};
