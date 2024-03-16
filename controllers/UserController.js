
const redirect_uri = `${process.env.APP_URL}:${process.env.PORT}/profile`;
const oauth_link = `${process.env.OAUTH_URL}?client_id=${process.env.OAUTH_CLIENT_ID}&redirect_uri=${redirect_uri}`

class UserController {

    getUserInfoHTML = async (credentials,main=true) => {
        if (credentials?.accessToken) {
            const userdata=await this.getUserData(credentials);
            console.log("userdata",userdata);
            return '<h6>USERINFO</h6>' +
            '<ul>'+
            Object.keys(userdata || {})?.map(key=>`<li>${key}: <b>${userdata[key]}</b></li>`).join("") +
            '</ul>' +
            (!main ?`<a href="/testcharge">Charge  user 1 credit</a><br />`:"") +
            (!main ?`<a href="/testcharge?amount=0.3">Charge  user 0.3 credit</a><br />`:"") +
            (!main ?`<a href="/testcharge?amount=1000000">Charge  user 1000000 credit</a><br /><br />`:"") +
            (!main ?`<a href="/transactions">Transactions history</a><br /><br />`:"") +
            (!main ?`<a href="/logout">Logout</a><br /><br />`:"")
        } else if (main)
            return '<a href="' + oauth_link + '">Login with blust AI</a>'
        else 
            return '<a href="/">Back to main</a>'
    }

    getUserTokenByCode = async (code) => {
        const data = {
            code,
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_SECRET,
            grant_type: "authorization_code",
            redirect_uri
        }
        var formBody = [];
        for (var property in data) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        let response = await fetch(process.env.USER_API_URL + '/token', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",

            },
            body: formBody
        })
        return response.json();
    }

    

    getUserData=async (credentials)=>{
        let response = await fetch(process.env.USER_API_URL + '/user', {
            method: 'GET',
            headers: {
               // "Content-Type": "application/json",
                "Authorization":"Bearer "+credentials?.accessToken
            }
        })
        return response.json();
    }

    testCharge=async(credentials,amount=1)=>{
        let response = await fetch(process.env.USER_API_URL + '/user/usage', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization":"Bearer "+credentials?.accessToken
            },
            body: JSON.stringify({amount})
        })
        return response.json();
    }


    getTransactionsHistory=async(credentials) => {
        let response = await fetch(process.env.USER_API_URL + '/user/usage', {
            method: 'GET',
            headers: {
                "Authorization":"Bearer "+credentials?.accessToken
            }
        })
        return response.json();
    }

    logout = async (credentials) => {
        let response = await fetch(process.env.USER_API_URL + '/token', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",

            },
            body: "token="+encodeURIComponent(credentials?.accessToken)
        })
        return response.json();
    }

}
module.exports = UserController;