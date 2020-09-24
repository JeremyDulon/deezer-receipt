/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
require("dotenv").config({
  path: __dirname + "/.env",
});
var appId = process.env.appId; // Your client id
var appSecret = process.env.appSecret; // Your secret
let redirectUri =
    process.env.redirectUri || "http://localhost:3000/callback/"; // Your redirect uri

var app = express();

app.use(express.static(__dirname + '/public'))
.use(cors())
.use(cookieParser());

app.get('/login', function (req, res) {
  // your application requests authorization
  res.redirect(
      'https://connect.deezer.com/oauth/auth.php?' +
      querystring.stringify({
        app_id: 436702,
        perms: 'basic_access,offline_access'
      }) + '&redirect_uri=' + redirectUri
  );
});

app.get('/callback', function (req, res) {
  // fs.writeFile('req.txt', req.toString(), (err => {
  // 	if (err) throw err;
  // }))
  var code = req.query.code || null;
  var error = req.query.error_reason || null;

  if (error) {
    res.redirect(
        '/#' +
        querystring.stringify({
          error: error
        })
    )
  } else {
    var authUrl = 'https://connect.deezer.com/oauth/access_token.php?' +
        querystring.stringify({
          app_id: appId,
          secret: appSecret,
          code: code,
          output: 'json'
        })

    request.get(authUrl, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        let jsonBody = JSON.parse(body)
        let access_token = jsonBody.access_token

        if (access_token) {
          res.redirect('/#?access_token=' + access_token)
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'no_access_token'
            })
          )
        }
      } else {
        res.redirect(
            '/#' +
            querystring.stringify({
              error: 'no_token'
            })
        )
      }
    });
  }
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Server is running on port 3000');
});
