angular.module("app.services", [])
    .factory("AuthInterceptorService", ["$q", "$injector", "$location", "LOCAL_STORAGE", "localStorageService", function($q, $injector, $location, LOCAL_STORAGE, localStorageService) {
        var AIS = {};

        var _request = function(config) {
            config.headers = config.headers || {};

            var authData = localStorageService.get(LOCAL_STORAGE.authData);
            if(authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
            }

            return config;
        }

        var _responseError = function(rejection) {
            if(rejection.status === 401) {
                var AS = $injector.get('AuthService');
                var authData = localStorageService.get(LOCAL_STORAGE.authData);

                if(authData) {
                    if(authData.useRefreshTokens) {
                        $location.path('/refresh');
                        return $q.reject(rejection);
                    }
                }
                AS.logOut();
                $location.path('/login');
            }
            return $q.reject(rejection);
        }

        return AIS.request = _request, AIS.responseError = _responseError, AIS;
    }])

    .factory("CommonService", ["PERMISSIONS", "$http", function(PERMISSIONS, $http) {
        var CS = {};

        var _sites = [];

        var _abilities = [];

        var _hasPermission = function(pf) {
            var hasAbility = !1;    
            angular.forEach(_abilities, function(ability) {
                if(ability == pf) hasAbility = !0;                         
            });                
            return hasAbility;
        }

        var _setPermission = function(roles) {
            angular.forEach(roles, function(role) {
                angular.forEach(PERMISSIONS[role], function(ability) {
                    _abilities.push(ability);
                })
            });
        }

        var _clearAbilities = function() {
            _abilities = [];
        }

        return CS.hasPermission = _hasPermission, CS.sites = _sites, CS.setPermission = _setPermission, CS.clearAbilities = _clearAbilities, CS;
    }])

    .factory("AuthService", ["$rootScope", "$http", "$location", "LOCAL_STORAGE", "localStorageService", "EVENTS", 'MessageService', 'CommonService', function($rootScope, $http, $location, LOCAL_STORAGE, localStorageService, EVENTS, MessageService, CommonService) {
        
        var serviceBase = '/api/';
        var clientId = 'wqm';

        var AS = {};

        var _authentication = {
            isAuth: !1,
            email: "",
            userName: "",
            roles: []
        };

        var _currentUser = function() {
            if(_authentication.email){
                if(_authentication.email === "")
                    return !1;
            } else {
                return !1;
            }
            return !0;
        }

        var _userName = function() {
            return _authentication.userName;
        }

        var _email = function() {
            return _authentication.email;
        }

        var _roles = function() {
            return _authentication.roles;
        }

        var _refresh = function() {

            var deferred = $rootScope.$q.defer();

            var authData = localStorageService.get(LOCAL_STORAGE.authData);
            if(!authData) {
                AS.logout();
                deferred.reject();
                return deferred.promise;
            }

            var sendData = "grant_type=refresh_token&client_id=" + clientId + "&refresh_token=" + authData.refreshToken;

            $http.post(serviceBase + 'token', sendData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded'}})
                .success(function(data) {
                    _postLogin(data);
                    deferred.resolve(data);
                })
                .error(function(data) {
                    AS.logout();
                    MessageService.error("small", "Authentication", "Failed to renew security session, please login again");
                    deferred.reject(data);
                });

            return deferred.promise;

        }

        var _login = function(loginData) {        

            var sendData = "grant_type=password&userName=" + loginData.email + "&password=" + loginData.password + "&client_id=" + clientId;
        
            var deferred = $rootScope.$q.defer();

            $http.post(serviceBase + 'token', sendData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded'}})
                .success(function(data) {
                    _postLogin(data);
                    deferred.resolve(data);
                })
                .error(function(data) {
                    AS.logout();
                    deferred.reject(data);
                });

            return deferred.promise;
        }

        var _postLogin = function(data) {
            localStorageService.set(LOCAL_STORAGE.authData, {
                token: data.access_token,
                email: data.email,
                userName: data.userName,
                roles: data.roles,
                refreshToken: data.refresh_token,
                useRefreshTokens: !0
            });

            _authentication.isAuth = !0;
            _authentication.email = data.email;
            _authentication.userName = data.userName;

            var roles = data.roles.split(",");
            for(var i = 0; i < roles.length; i++) {
                 _authentication.roles.push(roles[i]);
            }

            CommonService.setPermission(roles);

            $http.get(serviceBase + 'Site')
                .success(function(sites) {
                    angular.forEach(sites, function(site) {
                        CommonService.sites.push(site);
                    });
                })
        }

        var _logout = function() {
            localStorageService.remove(LOCAL_STORAGE.authData);
            _authentication.isAuth = !1;
            _authentication.email = "";
            _authentication.userName = "";
            CommonService.clearAbilities();
            CommonService.sites = [];
            $rootScope.$broadcast(EVENTS.logoutSuccess);
        }

        return AS.currentUser = _currentUser, AS.login = _login, AS.logout = _logout, AS.refresh = _refresh, AS.userName = _userName, AS.email = _email, AS.roles = _roles, AS
    }])