// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security', [
  'security.service',
  'security.service.local',
  'security.service.stub',
  'security.login']);
