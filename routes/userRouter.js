const express = require('express')
const {createUser, getUser,updateUser,initFetchData} = require('../controllers/userController');
const bet = require('../controllers/betController')
const promise = require('../controllers/promiseController')
const {getAllEvent} = require('../controllers/eventController')

const router = express.Router();

router.post('/users', createUser);
router.post('/bets', bet.createBet);
router.post('/promises',promise.createPromise)
router.post('/init_fetch_data',initFetchData)
router.post('/active_promises',promise.getActionPromises)

router.get('/users/:userId', getUser);
router.get('/getEvents', getAllEvent);
router.get('/bets',bet.getBets)
router.get('/bets/:promiseId',bet.getBet)
router.get('/promises',promise.getPromises)
router.get('/promises:creatorId',promise.getPromise)

router.put('/users/:userId', updateUser);
router.put('/bets/:promiseId',bet.updateBet);
router.put('/promises',promise.updatePromise);

module.exports = router;
