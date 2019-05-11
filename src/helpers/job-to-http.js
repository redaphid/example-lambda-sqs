// Generated by CoffeeScript 2.4.1
var JobToHttp, MeshbluAuthParser, _;

_ = require('lodash');

MeshbluAuthParser = require('../helpers/meshblu-auth-parser');

JobToHttp = (function() {
  class JobToHttp {
    constructor() {
      this.getMetadataFromHeaders = this.getMetadataFromHeaders.bind(this);
      this.metadataToHeaders = this.metadataToHeaders.bind(this);
      this.authParser = new MeshbluAuthParser;
    }

    httpToJob({jobType, request, toUuid, data}) {
      var auth, job, ref, systemMetadata, userMetadata;
      if (data == null) {
        data = request.body;
      }
      userMetadata = this.getMetadataFromHeaders(request.headers);
      auth = this.authParser.parse(request);
      systemMetadata = {
        auth: auth,
        fromUuid: (ref = request.get('x-meshblu-as')) != null ? ref : auth.uuid,
        toUuid: toUuid,
        jobType: jobType
      };
      job = {
        metadata: _.extend(userMetadata, systemMetadata),
        data: data
      };
      return job;
    }

    getMetadataFromHeaders(headers) {
      return _.transform(headers, (newMetadata, value, header) => {
        var key;
        header = header.toLowerCase();
        if (!_.startsWith(header, 'x-meshblu-')) {
          return;
        }
        key = _.camelCase(_.replace(header, "x-meshblu-", ''));
        return newMetadata[key] = value;
      });
    }

    metadataToHeaders(metadata) {
      var headers;
      headers = {};
      _.each(metadata, (value, key) => {
        var error, header;
        header = `x-meshblu-${_.kebabCase(key)}`;
        try {
          if (_.isString(value)) {
            return _.set(headers, header, value);
          }
          return _.set(headers, header, JSON.stringify(value));
        } catch (error1) {
          error = error1;
          console.error(error.stack);
          return console.error(header, JSON.stringify(value));
        }
      });
      return headers;
    }

    sendJobResponse({jobResponse, res}) {
      if (jobResponse == null) {
        return res.sendStatus(500);
      }
      res.set('Content-Type', 'application/json');
      res.set(this.metadataToHeaders(jobResponse.metadata));
      res.status(jobResponse.metadata.code);
      if (jobResponse.rawData == null) {
        return res.end();
      }
      return res.send(jobResponse.rawData);
    }

  };

  module.exports = JobToHttp;

  return JobToHttp;

}).call(this);
