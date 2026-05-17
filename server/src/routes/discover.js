const express = require('express');
const { getHomeDiscovery } = require('../controllers/discoverController');

const router = express.Router();

router.get('/home', getHomeDiscovery);

module.exports = router;