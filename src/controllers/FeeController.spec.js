const Fee = require("../models/fee");
jest.mock("../models/fee");

const FeeController = require('./FeeController');

describe('FeeController.feeProcessor', () => {

    it('should throw exception when currency not found', async() => {
        const req = {
            params: {},
            body: {
                "ID": 91203,
                "Amount": 5000,
                "Currency": "NGN",
                "CurrencyCountry": "NG",
                "Customer": {
                    "ID": 2211232,
                    "EmailAddress": "anonimized29900@anon.io",
                    "FullName": "Abel Eden",
                    "BearsFee": true
                },
                "PaymentEntity": {
                    "ID": 2203454,
                    "Issuer": "GTBANK",
                    "Brand": "MASTERCARD",
                    "Number": "530191******2903",
                    "SixID": 530191,
                    "Type": "CREDIT-CARD",
                    "Country": "NG"
                }
            }
        }
        
        Fee.findCurrency.mockResolvedValueOnce([]);

        await expect(FeeController.feeProcessor(req))
        .rejects.toThrow('No fee configuration for NGN transactions.');
    })


    it('should handle flat percentage type', async() => {
        const req = {
            params: {},
            body: {
                "ID": 91203,
                "Amount": 5000,
                "Currency": "NGN",
                "CurrencyCountry": "NG",
                "Customer": {
                    "ID": 2211232,
                    "EmailAddress": "anonimized29900@anon.io",
                    "FullName": "Abel Eden",
                    "BearsFee": true
                },
                "PaymentEntity": {
                    "ID": 2203454,
                    "Issuer": "GTBANK",
                    "Brand": "MASTERCARD",
                    "Number": "530191******2903",
                    "SixID": 530191,
                    "Type": "CREDIT-CARD",
                    "Country": "NG"
                }
            }
        }
        
        Fee.findCurrency.mockResolvedValue([{}])
        
        Fee.findConfigs.mockImplementationOnce( ({feeCurrency, feeLocale, feeEntity, feeProperty}) => {
            expect(feeCurrency).toMatchObject(["NGN"]);
            expect(feeLocale).toMatchObject(["LOCL"]);
            expect(feeEntity).toMatchObject(["CREDIT-CARD"]);
            expect(feeProperty).toMatchObject(["530191******2903", 530191, "MASTERCARD", "GTBANK"]);

            return [
                {"_id":{"$oid":"6236ffbe71c295eaa00589fa"},"feeId":"LNPY1223","feeCurrency":"NGN","priority":{"$numberInt":"1"},"feeLocale":"LOCL","feeProperty":"*","feeEntity":"CREDIT-CARD","feeType":"FLAT_PERC","feeValue":"50:1.4","createdAt":{"$date":{"$numberLong":"1647771582429"}},"__v":{"$numberInt":"0"}}
            ]
        
        })

        const response = await FeeController.feeProcessor(req);
        expect(response).toMatchObject({
            "AppliedFeeID": "LNPY1223",
            "AppliedFeeValue": 120,
            "ChargeAmount": 5120,
            "SettlementAmount": 5000    
        })
    })
})