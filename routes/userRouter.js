const express = require('express')
const user = require('../controllers/userController');
const bet = require('../controllers/betController')
const promise = require('../controllers/promiseController')
const {getAllEvent} = require('../controllers/eventController')

const router = express.Router();

router.post('/users', user.createUser);
router.post('/bets', bet.createBet);
router.post('/promises',promise.createPromise)
router.post('/init_fetch_data',user.initFetchData)
router.post('/active_promises',promise.getActivePromises)
router.post('/end_promises',promise.getEndPromises)
router.post('/deposit',user.deposit)

router.get('/users/:userId', user.getUser);
router.get('/getEvents', getAllEvent);
router.get('/bets',bet.getBets)
router.get('/bets/:promiseId',bet.getBet)
router.get('/promises',promise.getPromises)
router.get('/promises:creatorId',promise.getPromise)

router.put('/users/:userId', updateUser);
router.put('/bets/:promiseId',bet.updateBet);
router.put('/promises',promise.updatePromise);

module.exports = router;
