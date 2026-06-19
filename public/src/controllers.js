let Command
let MLSpinner
let MLList
const ora = require('ora')
const path = require("path")
const axios = require("axios")
const fs = require("fs/promises")
const cheerio = require("cheerio")
const { existsSync } = require("fs")
const Logs = path.join(__dirname, "../", "Logs")
const Settings = require("../json/Settings.json")
const settings = require("../json/Settings.json")
const Cache = path.join(__dirname, "../", "Cache")
const utils = path.join(__dirname, "../", "utils")
const Translation = require("../json/Translation.json")
const { spawnSync, spawn, exec } = require("child_process")
const YtdlWebsite = ["www.youtube.com", "www.instagram.com"]
const WaitSeconds = (Seconds) => new Promise((r) => { setTimeout(r, Seconds * 1000) })
const DevTools = {
    Debug: false
}
async function VerifyFolders() {

    fs.mkdir(Cache, { recursive: true })
    fs.mkdir(Logs, { recursive: true })
    fs.mkdir(`${path.join(__dirname, "../", "logs")}`, { recursive: true })
    if (!existsSync(`${Cache}/Videos.txt`)) { fs.writeFile(`${Cache}/Videos.txt`, '', "utf-8") };
    if (!existsSync(`${Cache}/Sounds.txt`)) { fs.writeFile(`${Cache}/Sounds.txt`, '', "utf-8") }
    if (!existsSync(`${Cache}/Books.txt`)) { fs.writeFile(`${Cache}/Books.txt`, '', "utf-8") }
    if (!existsSync(`${Logs}/yt-dlp.log`)) { fs.writeFile(`${Logs}/yt-dlp.log`, '', "utf-8") }
    if (!existsSync(`${Logs}/mangalivre.log`)) { fs.writeFile(`${Logs}/mangalivre.log`, '', "utf-8") }
    if (!existsSync(`${Logs}/Nexus-files.log`)) { fs.writeFile(`${Logs}/Nexus-files.log`, '', "utf-8") }

    const watcher = fs.watch(path.join(__dirname, "../"), { persistent: true })
    for await (const event of watcher) {
        const { EventType, filename } = event
        if (!filename) return;
        if (filename == "Cache" || filename == "Videos.txt" || filename == "Sounds.txt" || filename == "Books.txt" || filename == "Logs" || filename == "yt-dlp_log.txt" || filename == "Nexus-files.log") {
            fs.mkdir(Cache, { recursive: true })
            fs.mkdir(`${path.join(__dirname, "../", "logs")}`, { recursive: true })
            if (!existsSync(`${Cache}/Videos.txt`)) { fs.writeFile(`${Cache}/Videos.txt`, '', "utf-8") };
            if (!existsSync(`${Cache}/Sounds.txt`)) { fs.writeFile(`${Cache}/Sounds.txt`, '', "utf-8") }
            if (!existsSync(`${Cache}/Books.txt`)) { fs.writeFile(`${Cache}/Books.txt`, '', "utf-8") }
            if (!existsSync(`${Logs}/yt-dlp.log`)) { fs.writeFile(`${Logs}/yt-dlp.log`, '', "utf-8") }
            if (!existsSync(`${Logs}/mangalivre.log`)) { fs.writeFile(`${Logs}/mangalivre.log`, '', "utf-8") }
            if (!existsSync(`${Logs}/Nexus-files.log`)) { fs.writeFile(`${Logs}/Nexus-files.log`, '', "utf-8") }

            // 
        }
    }
}
const Donwload = class {
    constructor({ Path, UserData, DevData }) {
        try {
            this.Path = Path
            this.UserData = UserData
            this.Data = { ["Is-URL"]: false, Websites: undefined }
            try { /^https/.test(this.Path) ? this.Data['Is-URL'] = true : this.Data['Is-URL'] = false } catch (message) { this.ErrorManager.Logs({ message }) }
            this.Data["Is-URL"] ? this.Data.Websites = new URL(this.Path).hostname : this.Data.Websites = undefined
            if (this.Data.Websites === undefined) { (/\.(.{0,4}$)/).test(this.Path) && (/\.(.{0,4}$)/).exec(this.Path)[0].replace(".", "").includes("txt") ? this.Data.Websites = "File" : this.Data.Websites = undefined }
        } catch (message) {
            this.ErrorManager.Logs({ message })
        }
    }
    async __init__() {
        try {
            VerifyFolders()
            await WaitSeconds(2)
            if (this.Path === undefined) return
            if (this.Data["Is-URL"]) {
                if (YtdlWebsite.includes(this.Data.Websites)) {
                    await this.CoreYtdl({ Urls: this.Path })
                    return
                }
            }
            if (this.Data.Websites === "File") {
                await this.CoreYtdl({ Urls: this.Path })
                await this.ReadFile({ Path: this.Path })
                return
            }
            if (this.Data["Is-URL"]) {
                let WebsiteName = this.Data.Websites.replace(/^www\./, "").split(".").slice(-2)[0];
                const SelfFunction = this[`${WebsiteName.match(/^./)[0].toUpperCase()}${WebsiteName.match(/^(\w)(.*)/)[2]}`]
                if (SelfFunction) { await SelfFunction.bind(this)({ Urls: this.Path }) }
                return
            }
            console.log(Translation[Settings.Language].__init__.Error)
            await WaitSeconds(8)
        } catch (message) {
            this.ErrorManager.Logs({ message })
        }

    }


    ErrorManager = { Logs: async function ({ message }) { await fs.appendFile(path.join(Logs, "/", "Nexus-files.log"), `[error] ${message.toString() + "\n"}`) } }
    // fs.writeFile(`${Logs}/${`${new Date().getHours()}:${new Date().getMinutes().toString().length < 2 ? 0 : ""}${new Date().getMinutes()}`.toString().replace(":", "")}.log`, message.toString(), { encoding: "utf-8" })


    async ReadFile({ Path }) {
        const File = await (await fs.readFile(Path, { encoding: "utf-8" })).split("\n").map(url => url.trim()).filter(url => url !== '')
        for (const Urls of File) {
            if (!YtdlWebsite.includes(Urls)) {
                try { this.Data.Websites = new URL(Urls).hostname } catch (message) { this.ErrorManager.Logs({ message }); continue }
                let WebsiteName = this.Data.Websites.replace(/^www\./, "").split(".").slice(-2)[0]
                const SelfFunction = this[`${WebsiteName.match(/^./)[0].toUpperCase()}${WebsiteName.match(/^(\w)(.*)/)[2]}`]
                if (SelfFunction) { await SelfFunction.bind(this)({ Urls }) }
            }
        }
    }



    async CoreYtdl({ Urls }) {
        if (this.Data.Websites === "File") {
            if (this.UserData.Type === "Sounds") {
                Command = `"${utils}\\yt-dlp.exe" --yes-playlist -x --audio-format ${this.UserData.Format} --ffmpeg-location "${utils}\\ffmpeg.exe" -a "${Urls}" --audio-quality 0 --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Sounds.txt" --sleep-requests 5 --sleep-interval 3 --max-sleep-interval 5 -o "Download/Songs/%(uploader)s/%(title)s.%(ext)s" >> "${Logs}\\yt-dlp.log"`
            } else {
                Command = `"${utils}\\yt-dlp.exe" --ffmpeg-location "${utils}" -a "${Urls}" --yes-playlist -f "bv*[height<=4320]+ba/bv*+ba/b/best" --remux-video ${this.UserData.Format} --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Videos.txt" --sleep-requests 5 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Videos/%(uploader)s/%(title)s.%(ext)s" >> "${Logs}\\yt-dlp.log"`
            }
        } else {
            this.UserData.Type === "Sounds" ?
                Command = `"${utils}\\yt-dlp.exe" --yes-playlist -x --audio-format ${this.UserData.Format} --ffmpeg-location "${utils}\\ffmpeg.exe" --audio-quality 0 --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Sounds.txt" --sleep-requests 5 --sleep-interval 3 --max-sleep-interval 5 -o "Download/Songs/%(uploader)s/%(title)s.%(ext)s" "${Urls}" >> "${Logs}\\yt-dlp.log"` :
                Command = `"${utils}\\yt-dlp.exe" --ffmpeg-location "${utils}" --yes-playlist -f "bv*[height<=4320]+ba/bv*+ba/b/best" --remux-video ${this.UserData.Format} --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Videos.txt" --sleep-requests 5 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Videos/%(uploader)s/%(title)s.%(ext)s" "${Urls}" >> "${Logs}\\yt-dlp.log"`
        }
        await new Promise((resolver, reject) => {
            const ytdlp = spawn(Command, { shell: true, maxBuffer: 1024 * 1024 * 50, stdio: ['pipe', 'pipe', 'pipe'] })
            const Spinner = ora.default(Translation[Settings.Language]["yt-dlp"][this.UserData.Type]).start()
            ytdlp.on("close", () => { Spinner.succeed(Translation[Settings.Language]["yt-dlp"].Sucess); resolver() });
            ytdlp.on("error", (message) => { Spinner.fail(Translation[Settings.Language]['yt-dlp'].Error); this.ErrorManager.Logs({ message }); reject(message) });
        })

        await WaitSeconds(5)




        if (DevTools.Debug === true) {
            ytdlp.stderr.on('data', (data) => {
                console.error(`❌ ERROR: ${data.toString()}`);
            });

            ytdlp.stdout.on('data', (data) => {
                console.log(`EXIT: ${data.toString()}`);
            });

            ytdlp.on('close', (code) => {
                console.log(`Error Code: ${code}`);
            });
        }

        // ytdlp.stdout.on("data", (e) => {
        //     console.log(e.toString())
        // })
        //     ytdlp.stdout.on("data", (e) => { 


        // let data = e.toString()
        // const match = data.match(/\[download\]\s*(\d+(?:\.\d+)?)\s*%/)
        // if(match){
        //     console.log(`${match[1] || 0}%`) // Terminar sistema de Porcentagem
        // }

        //     })






    }
    // let data = e.toString()
    // const match = data.match(/\[download\]\s*(\d+(?:\.\d+)?)\s*%/)
    // if(match){
    //     console.log(`${match[1] || 0}%`) // Terminar sistema de Porcentagem

    // }

    async Mangalivre({ Urls }) {
        try {
            let MangalivreLogs = []
            await fs.mkdir("./Download", { recursive: true })
            await fs.mkdir("./Download/Books", { recursive: true })
            await WaitSeconds(Math.floor(Math.random() * 2) + 1)
            if (!Urls.includes("mangalivre.blog/manga")) {
                if (!MLSpinner){ MLSpinner = ora.default(Translation[Settings.Language].Book.Download).start()}
                let images = []
                let Response = await axios.get(Urls)
                let html = cheerio.load(Response.data)
                html('img.chapter-image[src$=".webp"], img.chapter-image[src$=".jpg"], img.chapter-image[src$=".jpeg"], img.chapter-image[src$=".png"], img.chapter-image[src$=".gif"]').each((i, el) => { images.push(html(el).attr('src')) })
                let title = /<title>(.*?)<\/title>/.exec(Response.data)[1].trim();
                let Chapter = Urls.split(/(capitulo-|chapter--)/)[2].replace('-', '.').replace("/", "").trim().replace(/[^\d.]/g, '').replace(/\.$/, "") || title.split(/(Chapter|Capítulo)/)[2].replace(/[^\d.]/g, '').replace(/\.$/, "")
                let Name = title.split(/(- Chapter|- Capítulo)/)[0].trimEnd().replace(/[<>:"/\\|?*]/g, '')
                await fs.mkdir(`./Download/Books/${Name}`, { recursive: true })
                await fs.mkdir(`./Download/Books/${Name}/${Chapter}`, { recursive: true })
                let BooksCache = new Set()
                const data = await fs.readFile(`${Cache}/Books.txt`, 'utf-8');
                data.split('\n').forEach(line => { if (line.trim()) BooksCache.add(line.trim()) });
                let CacheSave = []
                for (let [index, URL] of images.entries()) {
                    let time_start = performance.now()
                    const CacheKey = `${title} -> (${index})`
                    if (!BooksCache.has(CacheKey)) {
                        const img = await axios.get(URL, {
                            responseType: "arraybuffer",
                            timeout: 10000,
                            maxContentLength: Infinity,
                            validateStatus: function (status) {
                                return status >= 200 && status < 300;
                            }
                        })
                        if (!img.data || img.data.length === 0) {MangalivreLogs.push(`[info] File received Empty`);console.log(Translation[Settings.Language].__init__.Error)}
                        MangalivreLogs.push(`[info] Making a request to the internet`)
                        const filePath = `./Download/Books/${Name}/${Chapter}/${index}.${this.UserData.Format}`
                        await fs.mkdir(path.dirname(filePath), { recursive: true });
                        await fs.writeFile(filePath, img.data)
                        MangalivreLogs.push(`[info] Saving data`)
                        MangalivreLogs.push(`[info] I finished downloading: ${Name} Chapter: ${Chapter} Page: ${index} In the format: ${this.UserData.Format}`)
                        BooksCache.add(CacheKey)
                        CacheSave.push(CacheKey)
                        let time_end = performance.now()
                        MangalivreLogs.push(`[info] The Action took ${((time_end - time_start) / 1000).toFixed(0)} Seconds to complete!`)
                    } else {
                        MangalivreLogs.push(`[info] Elementro With the name of ${CacheKey} found in the cache, parsing the next one from the list`)
                    }
                }

                if (!MLList){
                    MLSpinner.succeed(Translation[Settings.Language].Book.Sucess)
                    MLSpinner = null
                }


                if (CacheSave.length > 0) { await fs.appendFile(`${Cache}/Books.txt`, CacheSave.join('\n') + '\n') }

                if (MangalivreLogs.length > 0) { await fs.appendFile(`${Logs}/mangalivre.log`, MangalivreLogs.join('\n') + '\n') }



            } else {
                await WaitSeconds(1)
                MLList = true
                let Chapters = []
                let Page = await axios.get(Urls)
                let Home = cheerio.load(Page.data)
                Home('.chapter-item .chapter-info a').each((i, el) => { Chapters.push(Home(el).attr('href')) })

                let Cover = Home('img.manga-cover-image.wp-post-image').attr('srcset').split(' ')[0]
                let BooksCache = new Set()
                const data = await fs.readFile(`${Cache}/Books.txt`, 'utf-8');
                data.split('\n').forEach(line => { if (line.trim()) BooksCache.add(line.trim()) });
                let CacheSave = []
                if (!BooksCache.has(Cover)) {
                    const img_cover = await axios.get(Cover, { responseType: "arraybuffer" })
                    let title = /<title>(.*?)<\/title>/.exec(Page.data)[1].trim().replace(/[<>:"/\\|?*]/g, '');
                    await fs.mkdir(`./Download/Books/${title}`, { recursive: true })
                    await fs.writeFile(`./Download/Books/${title}/cover.png`, img_cover.data)
                    BooksCache.add(Cover)
                    CacheSave.push(Cover)
                }
                if (CacheSave.length > 0) { await fs.appendFile(`${Cache}/Books.txt`, CacheSave.join('\n') + '\n') }
                for (Urls of Chapters) { await this.Mangalivre({ Urls }) }
                MLSpinner.succeed(Translation[Settings.Language].Book.Sucess)
                MLSpinner = null
                MLSpinner = false
                MLList = null
            }
            await WaitSeconds(5)

        } catch (message) { this.ErrorManager.Logs({ message }); console.log(Translation[Settings.Language].__init__.Error) }


























    }

}


module.exports = Donwload