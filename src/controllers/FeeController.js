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
        const feeNumber = Number

        let configs = await Fee.find({feeCurrency: Currency})
        if (configs.length === 0) {
            return res.status(404).json({ 
                error: `No fee configuration for ${Currency} transactions.`
            });
        }
        let localeType = checkLocale(CurrencyCountry,Country)
        if((Type === "CREDIT-CARD" || Type === "DEBIT-CARD")){
            //No wildcard
            if(Brand !== ""){
                configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`${Type}(${Brand})`})
                response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}
            }
            if(SixID !== ""){
                configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty: `${Type}(${SixID}`})
                response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}
            }
            if(feeNumber !== ""){
                configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty: `${Type}(${feeNumber})`})
                response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}
            }
            if(Issuer !== ""){
                configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty: `${Type}(${Issuer})`})
                response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}
            }

            //one wildcard
            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`${Type}(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`*(${Brand})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`*(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`*(${SixID})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`*(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`${Type}(${Brand})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`${Type}(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`${Type}(${SixID})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`${Type}(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`${Type}(${Brand})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`${Type}(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`${Type}(${SixID})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`${Type}(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            //two wildcards
            configs = await Fee.find({feeCurrency: `*`, feeLocale: `*`,feeEntityAndProperty:`${Type}(${Brand})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: `*`,feeEntityAndProperty:`${Type}(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: `*`,feeEntityAndProperty:`${Type}(${SixID})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: `*`,feeEntityAndProperty:`${Type}(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`*(${Brand})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`*(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`*(${SixID})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`*(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`*(${Brand})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`*(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`*(${SixID})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`*(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`*(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: localeType,feeEntityAndProperty:`${Type}(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: '*',feeEntityAndProperty:`${Type}(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            //three wildcards

            configs = await Fee.find({feeCurrency: '*', feeLocale: '*',feeEntityAndProperty:`*(${Brand})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: '*',feeEntityAndProperty:`*(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: '*',feeEntityAndProperty:`*(${SixID})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: '*',feeEntityAndProperty:`*(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: '*',feeEntityAndProperty:`${Type}(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: localeType,feeEntityAndProperty:`*(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: '*',feeEntityAndProperty:`*(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

        }


        if((Type === "BANK-ACCOUNT" || Type === "WALLET-CARD" || Type === "USSD")){
            if(feeNumber !== ""){
                configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty: `${Type}(${feeNumber})`})
                response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}
            }
            if(Issuer !== ""){
                configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty: `${Type}(${Issuer})` })
                response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}
            }

            //one wildcard
            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`${Type}(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`*(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`*(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`${Type}(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`${Type}(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`${Type}(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`${Type}(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            //two wildcards
            configs = await Fee.find({feeCurrency: `*`, feeLocale: `*`,feeEntityAndProperty:`${Type}(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: `*`,feeEntityAndProperty:`${Type}(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`*(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: `*`, feeLocale: localeType,feeEntityAndProperty:`*(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`*(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: `*`,feeEntityAndProperty:`*(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: localeType,feeEntityAndProperty:`*(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: localeType,feeEntityAndProperty:`${Type}(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: '*',feeEntityAndProperty:`${Type}(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}
           
            //three wildcards
            configs = await Fee.find({feeCurrency: '*', feeLocale: '*',feeEntityAndProperty:`*(${feeNumber})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: '*',feeEntityAndProperty:`*(${Issuer})`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: '*',feeEntityAndProperty:`${Type}(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: '*', feeLocale: localeType,feeEntityAndProperty:`*(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

            configs = await Fee.find({feeCurrency: Currency, feeLocale: '*',feeEntityAndProperty:`*(*)`})
            response = await prepareConfig(configs,Amount,BearsFee)
            if(response !== false){return res.status(200).json(response)}

        }
       
        //generic
        configs = await Fee.find({feeCurrency: '*', feeLocale: '*', feeEntityAndProperty:`*(*)`})
        response = await prepareConfig(configs,Amount,BearsFee)
        if(response !== false){return res.status(200).json(response)}
        
    } catch (error) {
        await log("FeeException", error, "default");
        return res.status(500).json({
            status: "failed",
            message: "An error Occurred Please Try again",
            errors: {},
        }); 
    }
}

const prepareConfig = (configs,amount,bearsFee) => {
    if (configs.length !== 0) {
        if (configs.length === 1) {
            let data = applyConfiguration(configs[0],amount,bearsFee)
            return data;
        }
        return false
    }
    return false
}



module.exports = {
    processTransaction,
    createFees,
    prepareConfig
  };