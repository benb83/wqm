angular.module('app.controllers', [])
	.controller('AppCtrl', ['$scope', '$rootScope', '$location', '$timeout', 'EVENTS', 'AuthService', 'CommonService', function(s, r, l, t, o, a, c) {
		// main controller
		s.isAppLoaded = !1;
		s.userSignedIn = !1;
		s.userName = "";

		s.$on(o.loginSuccess, function() {
        	s.userSignedIn = !0;
        	s.userName = a.userName();
        });

        s.$on(o.logoutSuccess, function() {
        	s.userSignedIn = !1;
        	s.userName = "";
        });

		s.canShow = function() {
        	var e = !1;        	
        	return s.isAppLoaded && (e = s.userSignedIn), e
    	}

    	s.logOut = function() {
    		a.logout();    
    		l.path("/login");
    	}

    	s.common = c;

    	t(function() { s.isAppLoaded = 1; }, 2000);
	}])
	.controller('LoginCtrl', ['$scope', '$location', '$rootScope', 'AuthService', 'EVENTS', 'MessageService', function($scope, $location, r, a, o, m) {
		
		a.refresh().then(
			function(e) {
				$scope.$emit(o.loginSuccess);
				$location.path('/dashboard');
			}
		);

		var u = function(t) {
        	$scope.loading = t
    	};
		var d = function() {
        	var e = $location.search();
        	if (e)
            	for (var r in e) $location.search(r, null)
    	};
    	d();

		$scope.Login = function(l) {
			$scope.submitted = !0, $location && $location.$invalid || (
				u(!0), a.login({email: $scope.email, password: $scope.password, useRefreshTokens: true}).then(
					function(e) {
            			e && r.$broadcast(o.loginSuccess), d(), u(!1)
        			}, function(e) {
            			u(!1), r.$broadcast(o.loginFailed), m.error("small", "Authentication", e.error_description)
        			}
        		)
        	);
		};

		$("#login-form").validate({
	        rules: {
	            email: {
	                required: !0
	            },
	            password: {
	                required: !0,
	                minlength: 1,
	                maxlength: 20
	            }
	        },
	        messages: {
	            email: {
	                required: "Please enter your email address",
	                email: "Please enter a valid email address"
	            },
	            password: {
	                required: "Please enter your password"
	            }
	        },
	        submitHandler: function() {
	            $scope.Login()
	        },
	        errorPlacement: function($scope, l) {
	            $scope.insertAfter($location.parent())
	        }
	    });
	}])
	.controller('DashboardCtrl', ['$scope', '$http', 'AuthService', 'CommonService', function($scope, $http, AuthService, CommonService) {
		var email = AuthService.email();
		// $http.get('/api/Account/' + email + '/Role')
			// .success(function(data) {
			// 	$scope.roles = data;
			// })
			// .error(function(data) {
			// 	alert("Error");
			// })
		$scope.common = CommonService;
	}])
	.controller('SiteCtrl', ["$scope", function($scope) {

	}])
	.controller('AdminCtrl', ["$scope", function($scope) {

	}]);