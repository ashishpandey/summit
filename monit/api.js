const router = require('express-promise-router')()
const status = require('./status')
const config = require('../appconfig')
const R = require('ramda');

router.get('/clusters', function(req, res) {
  return Promise.resolve(res.send(R.keys(config.clusters)));
});

router.get('/cluster/:clusterName/status', function(req, res) {
  console.log('loading status for', req.params.clusterName)
  return Promise.resolve().then(function() {
    return status.clusterStatus(req.params.clusterName)
  })
  .then(function(status) {
    res.send(status);
  })
});

router.get('/cluster/:clusterName/summary', function(req, res) {
  console.log('loading status for', req.params.clusterName)
  return Promise.resolve().then(function() {
    return status.clusterStatus(req.params.clusterName)
  })
  .then(status.clusterSummary)
  .then(function(summary) {
    res.send(summary);
  })
});

module.exports = router
