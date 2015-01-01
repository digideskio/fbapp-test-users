# fbapp-test-users

A node module to manage Facebook Test Users of an application.

- [List the test users](#getList)
- [Create a test user](#createUser)
- [Update a test user](#updateUser)
- [Delete a test user](#deleteUser)

## Installation

```
$ npm install fbapp-test-users

var FbTestUsers = require('fbapp-test-users');
```

## Usage

```js
var FbTestUsers = require('fbapp-test-users');

FbTestUsers.setAppId('XXXX');
FbTestUsers.setAppSecret('YYYY');
```

<a name="getList"></a>
### getList()

Retrieve the list of test users.

```js
FbTestUsers.getList()
.then(function(list) {
    // Example:
    /*
    [
        {
            id: '123456789',
            loginUrl: 'https://developers.facebook.com/checkpoint/test-user-login/123456789/',
            accessToken: 'XXXXXXXXXX',
            name: 'Open Graph Test User',
            link: 'http://www.facebook.com/123456789'
        }
    ]
    */
});
```

<a name="createUser"></a>
### createUser(args)

Create a test user.

#### Args

See the fields in the [official documentation](https://developers.facebook.com/docs/graph-api/reference/v1.0/app/accounts/test-users#pubfields).


```js
FbTestUsers.createUser({
    installed: false,
    name: 'Batman'
})
.then(function(createdUser) {
    // Example:
    /*
    {
        id: '123456789',
        email: 'xxx',
        login_url: 'https://developers.facebook.com/checkpoint/test-user-login/123456789/',
        password: '1876562816'
    }
    */
});
```

<a name="updateUser"></a>
### updateUser(userId, name, password)

Update a test user.

#### Args

`name` and `password` can be null if you don't want to update the name or password.

```js
FbTestUsers.updateUser(user.id, 'New name', 'New password')
.then(function success(res) {
    // This function returns the result of the operation [true|false]
    // Example:
    /*
    {
        success: true
    }
    */
});
```

<a name="deleteUser"></a>
### deleteUser(userId)

Delete a test user.

```js
FbTestUsers.deleteUser(user.id)
.then(function success(res) {
    // This function returns the result of the operation [true|false]
    // Example:
    /*
    {
        success: true
    }
    */
});
```

## License

MIT, see [LICENSE.md](http://github.com/tleunen/fbapp-test-users/blob/master/LICENSE.md) for details.