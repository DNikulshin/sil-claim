const { reset } = require('nodemon')
const puppeteer = require('puppeteer')
require('dotenv').config()
const fs = require('fs').promises
const fsSync = require('fs')
const path = require('path')


const username = process.env.LOGIN
const password = process.env.PASSWORD
const URL = process.env.URL
const URL2 = process.env.URL2

const settings = {
    headless: true,
    slowMo: 10,
    args: [
        '--start-maximized'
    ],
    defaultViewport: null,
    timeout: 1000 * 300,
    ignoreHTTPSErrors: true,
    ignoreDefaultArgs: ['--disable-extensions'],
    //executablePath: ''
}

 async function startParse () {
    try {
        const browser = await puppeteer.launch(settings)
        const page = await browser.newPage()
        const pathCookie = path.resolve(__dirname, './cookies.json')
        if(!fsSync.existsSync(pathCookie)) {
            await page.goto('https://erp.silinet.net/oper/')
            await page.waitForSelector('#login_page_form', { visible: true, timeout: 0 })
            await page.click('input[name="username"]')
            await page.type('input[name="username"]', username)
            await page.click('input[name="password"]')
            await page.type('input[name="password"]', password)
            await page.click('input[type="submit"]')
            const cookies = await page.cookies()
            await fs.writeFile(path.resolve(__dirname, './cookies.json'), JSON.stringify(cookies, null, 2))
            await page.goto(URL2)
            await page.content()
    
                 const allItems = await page.evaluate(() => {
                    const replaceAllLineBraek = (el) => el.replaceAll('\n', ' ')
                    const results = 
                    Array.from(document.querySelectorAll('.table_item'))
                    return results.map(result => {
                    return {
                        itemId: result.querySelector('td:nth-child(2)').innerText,
                        itemIdLink: result.querySelector('td:nth-child(2) > a').href,
                        type:  result.querySelector('td:nth-child(3)').innerText,
                        createDate:  replaceAllLineBraek(result.querySelector('td:nth-child(4)').innerText),
                        setDate: replaceAllLineBraek(result.querySelector('td:nth-child(5)').innerText),
                        address:  replaceAllLineBraek(result.querySelector('td:nth-child(6)').innerText) || {},
                        itemObject:  replaceAllLineBraek(result.querySelector('td:nth-child(7)').innerText) || {}
                    }
                    })
                 }) 
        }

        const cookiesString = await fs.readFile(path.resolve(__dirname, './cookies.json'));
        const setcookies = JSON.parse(cookiesString);
        await page.setCookie(...setcookies);
        await page.goto('https://erp.silinet.net/oper/')
        await page.waitForSelector('#login_page_form', { visible: true, timeout: 0 })
        await page.goto(URL2)
        await page.content()
    
        const allItems = await page.evaluate(() => {
            const replaceAllLineBraek = (el) => el.replaceAll('\n', ' ')
           const results = 
           Array.from(document.querySelectorAll('.table_item'))
           return results.map(result => {
           return {
               itemId: result.querySelector('td:nth-child(2)').innerText,
               itemIdLink: result.querySelector('td:nth-child(2) > a').href,
               type:  result.querySelector('td:nth-child(3)').innerText,
               createDate:  replaceAllLineBraek(result.querySelector('td:nth-child(4)').innerText),
               setDate: replaceAllLineBraek(result.querySelector('td:nth-child(5)').innerText),
               address:  replaceAllLineBraek(result.querySelector('td:nth-child(6)').innerText) || '',
               itemObject:  replaceAllLineBraek(result.querySelector('td:nth-child(7)').innerText) || '',
               description: replaceAllLineBraek(result.querySelector('td:nth-child(8)').innerText) || '',
               comments: replaceAllLineBraek(result.querySelector('td:nth-child(9)').innerText) || '',
               labels:  replaceAllLineBraek(result.querySelector('td:nth-child(10)').innerText) || '',
               executors:  replaceAllLineBraek(result.querySelector('td:nth-child(11)').innerText) || ''
           }
           })
        }) 

       return allItems

    } catch (e) { 
        console.log(e)
    }
}

module.exports = {
    startParse
}
