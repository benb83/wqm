var smartApp = angular.module('smartApp', [
		'ngRoute',
		'ngAnimate',
		'angular-loading-bar',
		'app.controllers',
		'app.services',
		'app.main',
//		'app.localize',
		'app.navigation',
//		'app.smartui',
		'ui.bootstrap',
		'ui.ladda',
		'LocalStorageModule'
	])

	.constant("EVENTS", {
	    loginSuccess: "auth-login-success",
	    loginFailed: "auth-login-failed",
	    logoutSuccess: "auth-logout-success",
	    sessionTimeout: "auth-session-timeout",
	    appInit: "app-init-loaded"
	})

	.constant("LOCAL_STORAGE", {
		authData: 'authData',
	    email: 'email',
	    username: 'username',
	    roles: 'roles'
	})

	.constant("PERMISSIONS", {
		user: [
			'Sites'
		],
		admin: [
			'Admin'
		],
		global_admin: [
			'Admin'
		]
	})

	.constant("routes", getRoutes())

	.config(['localStorageServiceProvider', '$routeProvider', "$locationProvider", "$httpProvider", "routes", function(localStorageServiceProvider, $routeProvider, $locationProvider, $httpProvider, routes) {
		localStorageServiceProvider
			.setPrefix('wqm');

		routes.forEach(function($locationProvider) {
	        $locationProvider.config.shared && $locationProvider.config.shared === !0 || ($locationProvider.config.resolve = {
	            navigate: ["AuthService", "$location", function(e, t) {
	                e.currentUser() || t.path("/login")
	            }]
	        }), 
	        $routeProvider.when($locationProvider.url, $locationProvider.config)
	    }), $routeProvider.otherwise({
	        redirectTo: "/dashboard"
	    });

	    $httpProvider.interceptors.push('AuthInterceptorService');
	}])

	.factory("MessageService", ["$modal", "$sce", function(e, t) {
	    var r = {},
	        o = function(e) {
	            return !e || 0 == e.trim().length
	        },
	        n = function(e, t, r) {
	            if (!o(r)) switch (void 0 == e && (e = "small"), e) {
	                case "big":
	                    $.bigBox({
	                        title: t,
	                        content: r,
	                        color: "#5384AF",
	                        icon: "fa fa-info fadeRight animated",
	                        timeout: 5e3
	                    });
	                    break;
	                case "small":
	                    $.smallBox({
	                        title: t,
	                        content: r,
	                        color: "#5384AF",
	                        iconSmall: "fa fa-info fadeRight animated",
	                        timeout: 5e3
	                    })
	            }
	        },
	        i = function(e, t, r) {
	            if (!o(r)) switch (void 0 == e && (e = "small"), e) {
	                case "big":
	                    $.bigBox({
	                        title: t,
	                        content: r,
	                        color: "#739E73",
	                        icon: "fa fa-check shake animated",
	                        timeout: 5e3
	                    });
	                    break;
	                case "small":
	                    $.smallBox({
	                        title: t,
	                        content: r,
	                        color: "#739E73",
	                        iconSmall: "fa fa-check shake animated",
	                        timeout: 4e3
	                    })
	            }
	        },
	        a = function(e, t, r) {
	            if (!o(r)) switch (void 0 == e && (e = "small"), e) {
	                case "big":
	                    $.bigBox({
	                        title: t,
	                        content: r,
	                        color: "#C79121",
	                        icon: "fa fa-warning swing animated",
	                        timeout: 5e3
	                    });
	                    break;
	                case "small":
	                    $.smallBox({
	                        title: t,
	                        content: r,
	                        color: "#C79121",
	                        iconSmall: "fa fa-warning swing animated",
	                        timeout: 5e3
	                    })
	            }
	        },
	        c = function(e, t, r) {
	            if (!o(r)) switch (void 0 == e && (e = "small"), e) {
	                case "big":
	                    $.bigBox({
	                        title: t,
	                        content: r,
	                        color: "#C46A69",
	                        icon: "fa fa-warning swing animated",
	                        timeout: 5e3
	                    });
	                    break;
	                case "small":
	                    $.smallBox({
	                        title: t,
	                        content: r,
	                        color: "#C46A69",
	                        iconSmall: "fa fa-warning swing animated",
	                        timeout: 5e3
	                    })
	            }
	        },
	        s = function(r, o, n, i) {
	            var a = "views/modules/modal/QuestionTmpl.html";
	            return void 0 !== i && (a = i), e.open({
	                templateUrl: a,
	                controller: ["$scope", "$modalInstance", function(e, n) {
	                    e.title = r, e.message = t.trustAsHtml(o), e.ok = function() {
	                        n.close("ok")
	                    }, e.cancel = function() {
	                        n.dismiss("cancel")
	                    }
	                }],
	                size: n
	            })
	        };
	    return r.warning = a, r.success = i, r.error = c, r.info = n, r.question = s, r
	}])

	.run(['$rootScope', '$location', 'EVENTS', '$q', 'LOCAL_STORAGE', 'localStorageService', '$window', function($rootScope, $location, EVENTS, $q, LOCAL_STORAGE, localStorageService, $window) {
		$rootScope.$on(EVENTS.loginSuccess, function() {
			$location.path("/dashboard");
		});
		$rootScope.$on(EVENTS.loginFailed, function() {
			localStorageService.remove(LOCAL_STORAGE.authData);
		});
		$rootScope.$on(EVENTS.logoutSuccess, function() {
			
		});
		$rootScope.$on("$locationChangeStart", function($rootScope, t) {
        	$window.ga && $window.ga("send", "pageview", {
            	page: t
        	})
    	});

		$rootScope.$q = $q;

		// Loaded
        // $rootScope.$emit(EVENTS.appInit);
	}]);

function getRoutes() {
    return [{
        url: "/login",
        config: {
            templateUrl: "views/login.html",
            controller: "LoginCtrl",
            shared: !0
        }
    }, {
        url: "/dashboard",
        config: {
            templateUrl: "views/dashboard.html",
            controller: "DashboardCtrl"
        }
    }, {
        url: "/",
        config: {
            templateUrl: "views/dashboard.html",
            controller: "DashboardCtrl"
        }
    }, {
    	url: "/site/:id",
    	config: {
    		templateUrl: "views/site.html",
    		controller: "SiteCtrl"
    	}
    }, {
    	url: "/admin",
    	config: {
    		templateUrl: "views/admin.html",
    		controller: "AdminCtrl"
    	}
    }]
}