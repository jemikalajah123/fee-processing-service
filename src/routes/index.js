const express = require('express')
const FeeController = require('../controllers/FeeController')
const router = express.Router();


router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Backyard'
    });
})

router.post('/compute-transaction-fee', FeeController.processTransaction )
router.post('/fees', FeeController.getFees )



module.exports = router;