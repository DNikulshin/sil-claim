// const { json } = require('express')
const express = require('express')
const path = require('path')
// require('dotenv').config()

const { startParse } = require('./puppeteer')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// app.use(json())

app.get('/', (req, res) => {
    try {
        const start = async () => await startParse()
        start()
            .then((data) => {
                res.render('index', {
                    title: 'Home Page',
                    data
                })
            })

    } catch (e) {
        console.log(e)
    }
})

app.listen(5555, '192.168.1.111', () => console.log('server started... http://192.168.1.111:5555'))





