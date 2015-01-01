'use strict';

var AppConfig = require('./config');
var FbTestUsers = require('../');
var assert = require('assert');

describe('Test users', function () {
    this.timeout(0);

    var createdUser = null;

    before(function() {
        FbTestUsers.setAppId(AppConfig.APP_ID);
        FbTestUsers.setAppSecret(AppConfig.APP_SECRET);
    });

    it('list users', function(done) {

        FbTestUsers.getList()
        .then(function success(list) {
            // every app has at least 1 test user called "Open Graph test user"
            assert( list.length > 0 );
            done();
        });

    });

    it('create user', function(done) {

        FbTestUsers.createUser({
            installed: false,
            name: 'Mocha test user'
        })
        .then(function success(user) {
            // save the user in case we have to delete him
            createdUser = user;

            // if the created user has an id, it's ok
            assert( user.hasOwnProperty('id') );
            done();
        });

    });

    it('update user', function(done) {

        // use the previously created user as an input
        FbTestUsers.updateUser(createdUser.id, 'Mocha Updated user')
        .then(function success(res) {

            assert( res['success'] == true );
            done();
        });

    });

    it('delete user', function(done) {

        // use the previously created user as an input
        FbTestUsers.deleteUser(createdUser.id)
        .then(function success(res) {

            assert( res['success'] == true );
            done();
        });

    });
});