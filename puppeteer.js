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
        if (!fsSync.existsSync(pathCookie)) {
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

            return await page.evaluate(() => {
                const replaceAllLineBreak = (el) => el.replaceAll('\n', ' ')
                const results =
                    Array.from(document.querySelectorAll('.table_item'))
                return results.map(result => {
                    return {
                        itemId: result.querySelector('td:nth-child(2)').innerText,
                        itemIdLink: result.querySelector('td:nth-child(2) > a').href,
                        type: result.querySelector('td:nth-child(3)').innerText,
                        createDate: replaceAllLineBreak(result.querySelector('td:nth-child(4)').innerText),
                        setDate: replaceAllLineBreak(result.querySelector('td:nth-child(5)').innerText),
                        address: replaceAllLineBreak(result.querySelector('td:nth-child(6)').innerText) || {},
                        itemObject: replaceAllLineBreak(result.querySelector('td:nth-child(7)').innerText) || {}
                    }
                })
            })
        }

        const cookiesString = await fs.readFile(path.resolve(__dirname, './cookies.json'))
        const setCookies = JSON.parse(cookiesString.toString())
        await page.setCookie(...setCookies)
        await page.goto(URL2)
        await page.content()
        return await page.evaluate(() => {
            const replaceAllLineBreak = (el) => el.replaceAll('\n', ' ')
            const results = Array.from(document.querySelectorAll('.table_item'))
            return results.map(result => {
                return {
                    itemId: result.querySelector('td:nth-child(2)').innerText,
                    itemIdLink: result.querySelector('td:nth-child(2) > a').href,
                    type: result.querySelector('td:nth-child(3)').innerText,
                    createDate: replaceAllLineBreak(result.querySelector('td:nth-child(4)').innerText),
                    setDate: replaceAllLineBreak(result.querySelector('td:nth-child(5)').innerText),
                    address: replaceAllLineBreak(result.querySelector('td:nth-child(6)').innerText) || '',
                    itemObject: replaceAllLineBreak(result.querySelector('td:nth-child(7)').innerText) || '',
                    description: replaceAllLineBreak(result.querySelector('td:nth-child(8)').innerText) || '',
                    comments: replaceAllLineBreak(result.querySelector('td:nth-child(9)').innerText) || '',
                    labels: replaceAllLineBreak(result.querySelector('td:nth-child(10)').innerText) || '',
                    executors: replaceAllLineBreak(result.querySelector('td:nth-child(11)').innerText) || ''
                }
            })
        })

    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    startParse
}
