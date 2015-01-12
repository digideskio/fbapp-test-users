'use strict';

var Promise = require("bluebird");
var Graph = require('fbgraph');
Promise.promisifyAll(Graph);

// set the latest version for the Facebook Graph API
Graph.setVersion('2.2');

var appId = '';
var appSecret = '';
var appAccessToken = null;
var FBgetTestUsersLimit = 50; // FB uses a limit of 50 by default so we'll use the same limit when making our requests

// auth to Facebook to get an App Access Token
function auth() {
    if(appAccessToken) {
        return Promise.resolve();
    }

    return Graph.authorizeAsync({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'client_credentials'
    });
}

// get the test users for a specific App id
function getTestUsers(limit) {
    // 0 means no limit
    var limit = typeof limit === 'undefined' ? 0 : limit || FBgetTestUsersLimit;

    var testUsers = [];

    return _getTestUsers(testUsers, limit).then(function() {
        return limit && testUsers.length > limit ? testUsers.slice(0, limit) : testUsers;
    });
}

function _getTestUsers(testUsers, limit, next) {
    var afterQuery = next ? '&after=' + next : '';
    var internalLimit = (!limit || limit>FBgetTestUsersLimit) ? FBgetTestUsersLimit : limit;
    var limitQuery = '?limit=' + internalLimit;

    return Graph.batchAsync([
        {
            method: 'GET',
            name: 'get-users',
            relative_url: appId + '/accounts/test-users' + limitQuery + afterQuery,
            omit_response_on_success: false
        },
        {
            method: 'GET',
            relative_url: '?ids={result=get-users:$.data.*.id}&fields=name'
        }
    ]).then(function(res) {
        if (res.length != 2) throw new Error('Cannot get test users: ' + err);
        // res should be an array of 2 elements (2 request responses)

        var getUserResponse = JSON.parse(res[0]['body']);
        var getProfileResponse = JSON.parse(res[1]['body']);
        var nbUsersReceived = getUserResponse['data'].length;

        getUserResponse['data'].forEach(function(testUser) {
            var user = {
                id: testUser['id'],
                loginUrl: testUser['login_url'],
                accessToken: testUser['access_token'],
                name: '[err] profile not found'
            };

            // push the element from the profile inside our user
            var profile = getProfileResponse[user.id];
            if(profile) {
                user.name = profile['name'];
            }

            testUsers.push(user);
        });

        // loop to get more users if needed and if there are more users to get
        var hasPaging = getUserResponse['paging'] && getUserResponse['paging']['cursors'] && getUserResponse['paging']['cursors']['after'];
        if( (!limit || testUsers.length < limit) && nbUsersReceived == internalLimit && hasPaging) {
            return _getTestUsers(testUsers, limit, getUserResponse['paging']['cursors']['after']);
        }
    });
}

// see fields here: https://developers.facebook.com/docs/graph-api/reference/v2.2/app/accounts/test-users#pubfields
function createUser(fields) {
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

function updateUser(userId, name, password) {
    var fields = {};
    if(name) fields.name = name;
    if(password) fields.password = password;

    return Graph.postAsync(userId, fields);
}

module.exports = {
    setAppId: function(id) {
        appId = id;
        appAccessToken = null;
    },
    setAppSecret: function(secret) {
        appSecret = secret;
        Graph.setAppSecret(secret);
        appAccessToken = null;
    },
    setAppAccessToken: function(token) {
        appAccessToken = token;
    },

    getList: function(limit) {
        return auth().then(getTestUsers.bind(null, limit));
    },
    createUser: function(fields) {
        return auth().then(createUser.bind(null, fields));
    },
    deleteUser: function(userId) {
        return auth().then(deleteUser.bind(null, userId));
    },
    updateUser: function(userId, name, password) {
        return auth().then(updateUser.bind(null, userId, name, password));
    }
}