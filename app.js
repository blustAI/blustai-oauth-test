if (process.env.APP_ENV !== 'prod') {
    require('dotenv').config();
}

const userController = new (require('./Controllers/UserController'))();


const bodyParser = require('body-parser');
const express = require('express');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let credentials = {};


app.get('/', async (req, res) => {

    let userinfoHTML = await userController.getUserInfoHTML(credentials);

    res.send('<html>' +
        '<head><title>+BlustAI  OAuth 2.0 test</title></head>' +
        '<body>' +
        '<h1>BlustAI  OAuth 2.0 test</h1>' +
        (req.query?.error ? `<i style="background-color:red;color:#fff;padding:10">${req.query.error }</i><br /><br />` : "") +
        userinfoHTML +
        '</body>' +
        '</html>')
});

app.get('/profile', async (req, res) => {
    let error

    if (req.query.authorizationCode) {
        //getting user token by authorizationCode
        let result = await userController.getUserTokenByCode(req.query.authorizationCode);
        if (result.accessToken) {
            credentials = result;
        } else {
            error = result?.error || "Error receiving credentials"
        }
    }

    let userinfoHTML = await userController.getUserInfoHTML(credentials, false);

    res.send('<html>' +
        '<head><title>+BlustAI  OAuth 2.0 test</title></head>' +
        '<body>' +
        '<h1>PROFILE</h1>' +
        (error ? `<i style="background-color:red;color:#fff;padding:10">${error}</i><br /><br />` : "") +
        (req.query?.error ? `<i style="background-color:red;color:#fff;padding:10">${req.query.error }</i><br /><br />` : "") +
        userinfoHTML +
        '</body>' +
        '</html>')
});

app.get('/testcharge', async (req, res) => {
    let error
    let chargeresult=await userController.testCharge(credentials,req.query?.amount || 1);
    if (chargeresult?.error) error= chargeresult.error;
    console.log("chargeresult",chargeresult);
    res.send('<html>' +
        '<head><title>Redirecting</title><script>window.location.href="/profile'+(error?`?error=${error}`:"")+'"</script></head>' +
        '<body> Redirecting ...</body>' +
        '</html>')
})


app.get('/transactions', async (req, res) => {
    let error
    let transactions=await userController.getTransactionsHistory(credentials);
    if (transactions?.error) error= transactions.error;
    console.log("transactions",transactions);
    res.send('<html>' +
        '<head><title>Transactions</title></head>' +
        '<body><h1>Transactions</h1></body>' +
        (error ? `<i style="background-color:red;color:#fff;padding:10">${error}</i><br /><br />` : "") +
        '<ul>'+(Array.isArray(transactions) && transactions?.map(tr=>`<li>${tr.date}: ${tr.amount}</li>`).join(""))+'</ul>' +
        '<br /><br /><br /><a href="/profile">Back to profile</a>'+
        '</html>')
})

app.get('/logout', async (req, res) => {
    let error
    let logoutresult=await userController.logout(credentials);
    if (logoutresult?.error) error= logoutresult.error;
    console.log("logoutresult",logoutresult);
    if (logoutresult?.success) credentials = {};
    res.send('<html>' +
        '<head><title>Redirecting</title><script>window.location.href="/'+(error?`?error=${error}`:"")+'"</script></head>' +
        '<body> Redirecting ...</body>' +
        '</html>')
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
});