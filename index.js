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
    });
}

// see fields here: https://developers.facebook.com/docs/graph-api/reference/v2.2/app/accounts/test-users#pubfields
function createUser(appId, fields) {
    return Graph.postAsync(appId + '/accounts/test-users', fields);
    /*
    Example of response:
    {
        id: '012345',
        email: 'xxx',
        login_url: 'https://developers.facebook.com/checkpoint/test-user-login/012345/',
        password: '1876562816'
    }
    */
}

function deleteUser(userId) {
    return Graph.delAsync(userId);
}

module.exports = {
    getList: function(appId, appSecret) {
        return auth(appId, appSecret)
                .then(getTestUsers.bind(null, appId));
    },
    createUser: function(appId, appSecret, fields) {
        return auth(appId, appSecret)
                .then(createUser.bind(null, appId, fields));
    },
    deleteUser: function(appId, appSecret, userId) {
        return auth(appId, appSecret)
                .then(deleteUser.bind(null, userId));
    }
}