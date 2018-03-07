const request = require('request-promise-native');
const xml2js = require('xml2js-es6-promise');
const config = require('../appconfig');
const R = require('ramda');

const req_default_options = {
  timeout: 5000
}

const summarizeInstance = function(clusterName, monit) {
  return request(monit.instanceUrl + '/_status?format=xml', {...req_default_options, ...monit.req_options})
    .then(function(statusXml) {
      return xml2js(statusXml, {explicitArray : false});
    })
    .then(function(status) {
      return {
        cluster: clusterName,
        instance: monit.instanceName,
        instanceOk: true,
        response: status
      }
    })
    .catch(function(err) {
      console.log('error', err);
      return {
        cluster: clusterName,
        instance: monit.instanceName,
        instanceOk: false,
        error: err
      }
    });
}

const clusterStatus = function(clusterName) {
  const clusterConfig = config.clusters[clusterName];
  const { monits, req_options } = clusterConfig;
  const toInstance = instanceName => {
    return {
      instanceName: instanceName,
      instanceUrl: monits[instanceName],
      req_options: req_options || {}
    }
  }

  const instanceRequests = R.map(
      instanceInfo => summarizeInstance(clusterName, instanceInfo),
      R.map(toInstance, R.keys(monits))
    );

  return Promise.all(instanceRequests);
}

const clusterSummary = function(status) {
  const explodeInstance = instanceStatus => {
    const { cluster, instance, instanceOk, response } = instanceStatus;
    const toType = svcType => {
      switch(svcType) {
        case '1': return 'directory';
        case '2': return 'file';
        case '3': return 'process';
        case '4': return 'host';
        case '5': return 'system';
        case '6': return 'fifo';
        case '7': return 'program';
        default: return 'unknown';
      }
    }
    const strToBool = s => Boolean(Number(s));
    const serviceInfo = service => {
      const serviceOk = !strToBool(service.status);
      const monitoredOk = strToBool(service.monitor);
      const pendingActions = strToBool(service.pendingaction);
      const trafficLight = (instanceOk && serviceOk) ? ((monitoredOk && !pendingActions) ? 'green' : 'orange') : 'red'
      return {
        cluster: cluster,
        instance: instance,
        instanceOk: instanceOk,
        service: service.name,
        type: toType(service.$.type),
        serviceOk: serviceOk,
        led: trafficLight,
        allOk: trafficLight == 'green',
        monitored: monitoredOk,
        pendingaction: pendingActions
      }
    }
    if(response && response.monit) {
      return R.map(serviceInfo, response.monit.service)
    }
    else {
      return {
        cluster: cluster,
        instance: instance,
        instanceOk: instanceOk,
        led: 'red',
        allOk: false
      }
    }
  }
  return R.chain(explodeInstance, status);
}

module.exports = exports = {
  clusterStatus,
  clusterSummary
}
