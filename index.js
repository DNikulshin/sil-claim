const { json } = require('express')
const express = require('express')
const path = require('path')
const { startParse }  = require('./puppeteer')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(json())

app.get('/', function(req, res) {
    try {
        async function start () {
            const data = await startParse()
            return data   
      }
      start()
      .then((data) => {
        console.log(data)
        res.render('index',{
            title: 'Home Page',
            data
         })
      })
    } catch(e) {
        console.log(e)
    }
})

 app.listen(5555, '192.168.1.102',() => console.log('server started... http://localhost:5555'))

      



