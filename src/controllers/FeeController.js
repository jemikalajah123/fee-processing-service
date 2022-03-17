const redis = require('redis');
const redisPort = 6379;
const client = redis.createClient(redisPort);
const { checkLocale, FEE_ENTITYS, getAppliedFee, getChargeAmount, getSettlementAmount, applyConfiguration } = require('../utils/helper');
const Fee = require("../models/fee");
const { log } = require("../../logger");
const { config } = require('dotenv');
const { date } = require('validatorjs/src/lang/en');


const createFees = async (req, res) => {
    try {
        const inputData = req.body;

        const {FeeConfigurationSpec} = inputData
		const splitConfiguration = FeeConfigurationSpec.split('\n');
		let current = [];
        let FeeConfiguration=[];
		let formatedData;

		for (let i = 0; i < splitConfiguration.length; i++) {
			current.push(splitConfiguration[i]);
		}
        
		for (let i = 0; i < current.length; i++) {
			const splitCurrent = current[i].split(' ');
            const checkFeeId = await Fee.findOne({
                feeId: splitCurrent[0],
              });

			if (checkFeeId === null){
                formatedData = {
				feeId: splitCurrent[0],
				feeCurrency: splitCurrent[1],
				feeLocale: splitCurrent[2],
				feeEntityAndProperty: splitCurrent[3],
				feeType: splitCurrent[6],
				feeValue: splitCurrent[7],
                }
                FeeConfiguration.push(formatedData)
			}; 
		}

        const options = { ordered: true };
        await Fee.insertMany(FeeConfiguration, options);
		return res.status(200).json({ 
            status: 'ok'
        });
        
    } catch (error) {
        await log("FeeException", error, "default");
        return res.status(500).json({
            status: "failed",
            message: "An error Occurred Please Try again",
            errors: {},
        });
    }
}

const processTransaction = async (req, res) => {
    try {
        const inputData = req.body;
        const {Currency, CurrencyCountry, Amount, Customer, PaymentEntity} = inputData
        const {BearsFee} = Customer
        const {Brand,Type,Country,Issuer, Number, SixID} = PaymentEntity

        let configs = await Fee.find({feeCurrency: Currency})
        if (configs.length === 0) {
            return res.status(404).json({ 
                error: `No fee configuration for ${Currency} transactions.`
            });
        }
        let localeType = checkLocale(CurrencyCountry,Country)
        configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType})
        if (configs.length !== 0) {
            if (configs.length === 1) {
                let data = applyConfiguration(configs[0],Amount,BearsFee)
                return res.status(200).json(data);
            }
            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:{$regex : Type}})
            if (configs.length !== 0) {
                if (configs.length === 1) {
                    let data = applyConfiguration(configs[0],Amount,BearsFee)
                    return res.status(200).json(data);
                }
                if((Type === "CREDIT-CARD" || Type === "DEBIT-CARD")){
                    if(Brand !== ""){
                        configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:{$regex : `${Type}(${Brand})`}})
                        if (configs.length !== 0) {
                            if (configs.length === 1) {
                                let data = applyConfiguration(configs[0],Amount,BearsFee)
                                return res.status(200).json(data);
                            }
                        }
                    }
                    if(SixID !== ""){
                        configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:{$regex : `${Type}(${SixID})`}})
                        if (configs.length !== 0) {
                            if (configs.length === 1) {
                                let data = applyConfiguration(configs[0],Amount,BearsFee)
                                return res.status(200).json(data);
                            }
                        }
                    }
                    if(Number !== ""){
                        configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:{$regex : `${Type}(${Number})`}})
                        if (configs.length !== 0) {
                            if (configs.length === 1) {
                                let data = applyConfiguration(configs[0],Amount,BearsFee)
                                return res.status(200).json(data);
                            }
                        }
                    }
                    if(Issuer !== ""){
                        configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:{$regex : `${Type}(${Issuer})`}})
                        if (configs.length !== 0) {
                            if (configs.length === 1) {
                                let data = applyConfiguration(configs[0],Amount,BearsFee)
                                return res.status(200).json(data);
                            }
                        }
                    }

                }
                if((Type === "BANK-ACCOUNT" || Type === "WALLET-CARD" || Type === "USSD")){
                    if(Number !== ""){
                        configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:{$regex : `${Type}(${Number})`}})
                        if (configs.length !== 0) {
                            if (configs.length === 1) {
                                let data = applyConfiguration(configs[0],Amount,BearsFee)
                                return res.status(200).json(data);
                            }
                        }
                    }
                    if(Issuer !== ""){
                        configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:{$regex : `${Type}(${Issuer})`}})
                        if (configs.length !== 0) {
                            if (configs.length === 1) {
                                let data = applyConfiguration(configs[0],Amount,BearsFee)
                                return res.status(200).json(data);
                            }
                        }
                    }

                }
            }
        }
        
    } catch (error) {
        await log("FeeException", error, "default");
        return res.status(500).json({
            status: "failed",
            message: "An error Occurred Please Try again",
            errors: {},
        }); 
    }
}



module.exports = {
    processTransaction,
    createFees,
  };