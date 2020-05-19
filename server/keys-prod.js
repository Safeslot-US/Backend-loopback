module.exports = { 
    google: { 
        clientID: "process.env.CLIENT_ID", 
        clientSecret: "process.env.CLIENT_SECRET"
    }, 
    session: {
        cookieKey: 'process.env.COOKIE_KEY'
    }, 
    nodeMailer: {
        key: 'process.env.NODEMAILER_KEY'
    }, 
    mongo_URI: 'process.env.MONGO_URI'
}