'use strict';

var Promise = require("bluebird");
var Graph = require('fbgraph');
Promise.promisifyAll(Graph);

// set the latest version for the Facebook Graph API
Graph.setVersion('2.2');

// auth to Facebook to get an App Access Token
function auth(appId, appSecret) {
    return Graph.authorizeAsync({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'client_credentials'
    })
    .catch(function(e) {
        throw new Error('Cannot retrieve app access token: ' + e);
    });
}

// get the test users for a specific App id
function getTestUsers(appId) {
    return Graph.batchAsync([
        {
            method: 'GET',
            name: 'get-users',
            relative_url: appId + '/accounts/test-users?limit=500',
            omit_response_on_success: false
        },
        {
            method: 'GET',
            relative_url: '?ids={result=get-users:$.data.*.id}'
        }
    ]).then(function(res) {
        if (res.length != 2) throw new Error('Cannot get test users: ' + err);
        // res should be an array of 2 elements (2 request responses)

        var getUserResponse = JSON.parse(res[0]['body'])['data'];
        var getProfileResponse = JSON.parse(res[1]['body']);

        var testUsers = [];
        getUserResponse.forEach(function(testUser) {
            var user = {
                id: testUser['id'],
                loginUrl: testUser['login_url'],
                accessToken: testUser['access_token'],
                name: '[err] profile not found',
                link: ''
            };

            // push the element from the profile inside our user
            var profile = getProfileResponse[user.id];
            if(profile) {
                user.name = profile['name'];
                user.link = profile['link'];
            }

            testUsers.push(user);
        });

        return testUsers;
    })
    .catch(function(e) {
        throw new Error('Cannot get test users: ' + e);
    });
}


module.exports = {
    getList: function(appId, appSecret) {
        return auth(appId, appSecret)
               .then(function() {
                    return getTestUsers(appId);
               });
    }
}