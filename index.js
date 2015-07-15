'use strict';

var common = require('common-expresscions'),
    scxml = require('scxml'),
    uuid = require('uuid');

function initApi(model, scxmlString, modelName, cb) {
  var models = {};
  var instances = {};
  var instanceSubscriptions = {};
  var api = {};

  function createNamedInstance(instanceId, res) {
    var instance = new scxml.scion.Statechart(model, { sessionid: instanceId });

    instances[instanceId] = instance;

    res.setHeader('Location', instanceId);

    res.status(201).send({ name: 'success.create.instance', data: { id: instanceId }});
  };

  api.getStatechartDefinition = function(req, res){
    res.type('application/scxml+xml').status(200).send(scxmlString);
  };

  api.createInstance = function(req, res) {
    var instanceId = uuid.v1();
    createNamedInstance(instanceId, res);
  };

  api.createNamedInstance = function(req, res) {
    var instanceId = req.params.InstanceId;
    if(instances[instanceId]){
      return res.status(409).send({ name: 'error.creating.instance', data: { message: 'InstanceId is already associated with an instance' }});
    }

    createNamedInstance(instanceId, res);
  };

  api.getInstances = function(req, res) {
    res.send({ name: 'success.get.instances', data: {instances : Object.keys(instances)}});
  };

  api.getInstance = function(req, res){
    getInstance(req, res, function(instanceId, instance){
      res.send({ name: 'success.get.instance', data: { instance: { snapshot: instance.getSnapshot() }}});
    });
  };

  api.sendEvent = function(req, res) {
    getInstance(req, res, function(instanceId, instance){
      var event = req.body;

      try {
        if(event.name === 'system.start') {
          instance.start();
        } else {
          instance.gen(event);
        }
      } catch(e){
        return res.status(500).send({ name: 'error.sending.event', data: e.message});
      }

      var snapshot = instance.getSnapshot();
      res.setHeader('X-Configuration',JSON.stringify(snapshot[0]));
      //TODO: handle custom data
      return res.send({ name: 'success.event.sent', data: { snapshot: snapshot }});
    });
  };

  function getInstance(req, res, done){
    var instanceId = req.params.InstanceId;
    var instance = instances[instanceId];
    if(instance){
      done(instanceId, instance);
    } else {
      res.status(404).send({'name':'error.instance.not.found'});
    }
  }

  api.deleteInstance = function(req, res){
    getInstance(req, res, function(instanceId, instance){
      delete instances[instanceId];
      res.send({ name: 'success.deleting.instance', data: { message: 'Instance deleted successfully.' }});
    });
  };

  api.getInstanceChanges = function(req, res){
    getInstance(req, res, function(instanceId, instance){
      common.sse.initStream(req, res, function(){});

      instanceSubscriptions[instanceId] = instanceSubscriptions[instanceId] || [];

      instanceSubscriptions[instanceId].push(res);

      instance.on('*',function(name, data){
        res.write('event: ' + name + '\n');
        res.write('data: ' + data + '\n\n');
      });
    });
  };

  api.getEventLog = function (req, res) {
    res.status(501).send({'name':'Not implemented'});
  };

  cb(null,api);
};

module.exports.initExpress = common.initExpress.bind(this, initApi);
