var configForDevelopment = {
    loginRedirect: '#/welcome',
	providers: {
         identSrv : {
            name: 'identSrv',
            url: '/auth/identSrv',
            authorizationEndpoint: 'http://localhost:22530/connect/authorize', //if this ends with slash --> game over
            redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
            scope: ['profile', 'openid'],
            responseType :'code',
            scopePrefix: '',
            scopeDelimiter: ' ',
            requiredUrlParams: ['scope', 'nonce'],
            optionalUrlParams: ['display', 'state'],
            display: 'popup',
            type: '2.0',
            clientId: 'jsclient',
            popupOptions: { width: 452, height: 633 }
        },
		google: {
			//responseType :'code',
			clientId: '801326454301-tsuiarqvd6gscnqja775kt0q2slqpebg.apps.googleusercontent.com',
			state: function(){
          var val = ((Date.now() + Math.random()) * Math.random()).toString().replace(".", "");
          return encodeURIComponent(val);
      }
		},
		linkedin:{
			clientId:'notdc3fahnof'
		},
		facebook:{
			clientId:'1093274847398378'
		},
		github:{
			clientId:'4b3668edd54e0a6b1aba'
		},
    live: {
      clientId: '000000004C1B5008'
    }

    // No additional setup required for Twitter
	}
};

var configForProduction = {
	providers: {
		google: {
			clientId: '801326454301-tsuiarqvd6gscnqja775kt0q2slqpebg.apps.googleusercontent.com'
		},
		linkedin:{
			clientId:'notdc3fahnof'
		},
		facebook:{
			clientId:'1093274847398378'
		},
		github:{
			clientId:'4b3668edd54e0a6b1aba'
		},
    live: {
      clientId: '000000004C1B5008'
    }

    // No additional setup required for Twitter
	}
};
var config ;
if (window.location.hostname==='localhost') {
	config = configForDevelopment;
}
else{
	config = configForProduction;
}


export default config;
