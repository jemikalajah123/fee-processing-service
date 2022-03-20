const { checkLocale, getAppliedFee, getChargeAmount, getSettlementAmount, applyConfiguration } = require('../utils/helper');
const Fee = require("../models/fee");
const { log } = require("../../logger");
const { config } = require('dotenv');


const createFees = async (req, res) => {
    try {
        const inputData = req.body;
        const {FeeConfigurationSpec} = inputData
        //format fee configurations for DB storage
        const FeeConfiguration = await formatFeeConfig(FeeConfigurationSpec)
        //store data in DB
        const options = { ordered: true }
        FeeConfiguration.length !== 0 && await Fee.insertMany(FeeConfiguration, options)
		return res.status(200).json({ 
            status: 'ok'
        });
        
    } catch (error) {
        await log("FeeException", error, "default")
        return res.status(500).json({
            Error: error.message
        });
    }
}

const formatFeeConfig = async (FeeConfigurationSpec) => {
    const splitConfiguration = FeeConfigurationSpec.split('\n')
    let FeeConfiguration=[];
    let formatedData;
    for (const current of splitConfiguration) {
        const splitCurrent = current.split(' ')
        let priority = 0;
        //check if feeId Configuration already exist
        const checkFeeId = await Fee.findOne({
            feeId: splitCurrent[0],
        });

       let splitEntityAndProperty=splitCurrent[3].split('(')
       splitEntityAndProperty[1] = splitEntityAndProperty[1].replace(/[&\/)]/g, '')

        if (checkFeeId === null){
            //set priority base on the number of *
            splitCurrent[1] === "*" && priority++
            splitCurrent[2] === "*" && priority++
            splitEntityAndProperty[0] === "*" && priority++
            splitEntityAndProperty[1] === "*" && priority++

            //set fee configuration format
            formatedData = {
            feeId: splitCurrent[0],
            feeCurrency: splitCurrent[1],
            feeLocale: splitCurrent[2],
            feeEntity: splitEntityAndProperty[0],
            feeProperty: splitEntityAndProperty[1],
            priority: priority,
            feeType: splitCurrent[6],
            feeValue: splitCurrent[7],
            }
            FeeConfiguration.push(formatedData)
        }; 
    }
    return FeeConfiguration; 
}

const computeTransaction = async (req, res) => {
    try {
       const startTrnx = await feeProcessor(req)
       return res.status(200).json(startTrnx)       
    } catch (error) {
        await log("FeeException", error, "default");
        return res.status(404).json({
            Error: error.message
        }); 
    }
}

const prepareConfig = (configs,amount,bearsFee) => {
    //applys configuration
    let data = applyConfiguration(configs[0],amount,bearsFee)
    return data; 
}

const feeProcessor = async (req) => {
    //get input data
    const inputData = req.body;
    const {Currency, CurrencyCountry, Amount, Customer, PaymentEntity} = inputData
    const {BearsFee} = Customer
    const {Brand,Type,Country,Issuer, Number: feeNumber, SixID} = PaymentEntity
    let response;
    
    //check if Currency Configuration Exist
    let configs = await Fee.findCurrency(Currency);
    if (configs.length === 0) {           
        throw new Error(`No fee configuration for ${Currency} transactions.`)       
    }
    
    //Check if the transaction is local or international
    let localeType = checkLocale(CurrencyCountry,Country);

    //get the configuration to apply
    const config = await Fee.findConfigs({
        feeLocale: [localeType],
        feeCurrency: [Currency],
        feeEntity: [Type],
        feeProperty: [feeNumber,SixID,Brand,Issuer],
    });
    return await prepareConfig(config,Amount,BearsFee)
}

module.exports = {
    computeTransaction,
    createFees,
    prepareConfig,
    feeProcessor,
  };