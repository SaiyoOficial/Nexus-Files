const language = require("../json/language.json")
const settings = require("../json/settings.json")
const ora = require("ora")
const path = require("path")
const execPromise = require("util").promisify(require("child_process").exec)
const WaitSeconds = (ms) => new Promise((r) => { setInterval(r, ms) })
const utils = path.join(__dirname, "../utils")
const Cache = path.join(__dirname, "../../Cache")
let Retry = 3
const CheckURL = async ({ url }) => {
    const Websites = ['www.youtube.com']
    const Data = { Type: "", InList: false }
    url.includes('.txt') ? Data.Type = "file" : Data.Type = "text"
    if (url.includes('.txt')) { return { Success: true, Type: Data.Type, message: null } }
    try {
        Websites.includes(new URL(url).hostname) ? Data.InList = true : Data.InList = false
        if (Data.InList == true) { return { Success: true, Type: Data.Type, message: null } } else {
            console.clear()
            console.log(`\x1b[37m --==--  \x1b[31m${language[settings.language].files.noinlist}\x1b[37m --==-- \x1b[0m`)
            await WaitSeconds(10000)
            console.clear()
            return { Success: false, Type: Data.Type }
        }
    } catch {
        console.clear()
        console.log(`\x1b[37m --==--  \x1b[31m${language[settings.language].files.UrlOnly}\x1b[37m --==--\x1b[0m`)
        await WaitSeconds(5000)
        console.clear()
        return { Success: false, Type: Data.Type }
    }
}

module.exports = {

    async DownloadSounds({ url, format }) {
        const Verify = await CheckURL({ url })
        if (Verify.Success == true) {
            const Spinner = ora.default("").start()
            if (Verify.Type == "text") {
                Spinner.color = "yellow"
                Spinner.text = `--> \x1b[32m${language[settings.language].Songs.Spinner.DownloadingSounds}\x1b[0m <--`
                await execPromise(`"${utils}\\yt-dlp.exe" --yes-playlist -x --audio-format ${format} --ffmpeg-location "${utils}\\ffmpeg.exe" --audio-quality 0 --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Songs.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Songs/%(uploader)s/%(title)s.%(ext)s" "${url}"`,{ maxBuffer: 1024 * 1024 * 50 })
                Spinner.succeed(`--==-- \x1b[32m${language[settings.language].Songs.Spinner.FullDownloads}\x1b[0m --==--`)
                await WaitSeconds(3000)
                console.clear()
            }

            if (Verify.Type == "file") {
                Spinner.color = "yellow"
                Spinner.text = `--> \x1b[32m${language[settings.language].Songs.Spinner.DownloadingSounds}\x1b[0m <--`
                try { await execPromise(`"${utils}\\yt-dlp.exe" -a ${url} --yes-playlist -x --audio-format ${format} --ffmpeg-location "${utils}\\ffmpeg.exe" --audio-quality 0 --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Songs.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Songs/%(uploader)s/%(title)s.%(ext)s"`, { maxBuffer: 1024 * 1024 * 50 }) }
                catch {
                    Spinner.fail(language[settings.language].Error.Default)
                    await WaitSeconds(3000)
                    console.clear()
                    if (Retry > 0) {
                        Retry-- 
                        console.log(`\x1b[37m --==--  \x1b[31m${language[settings.language].Error.Retry}\x1b[37m --==-- \x1b[0m`)
                        await WaitSeconds(3000)
                        console.clear()
                        await WaitSeconds(500)
                        this.DownloadSounds({ format, url })
                    } else {
                        console.log(`\x1b[37m --==--  \x1b[31m${language[settings.language].Error.MaxRetry}\x1b[37m --==-- \x1b[0m`)
                        await WaitSeconds(5000)
                        Retry = 3
                        console.clear()
                    }
                }
                Spinner.succeed(`--==-- \x1b[32m${language[settings.language].Songs.Spinner.FullDownloads}\x1b[0m --==--`)
            }
        }
    },

    async DownloadVideos({ url, format }) {
        const Verify = await CheckURL({ url })
        if (Verify.Success == true) {
            const Spinner = ora.default("").start()
            if (Verify.Type == "text") {
                Spinner.color = "yellow"
                Spinner.text = `--> \x1b[32m${language[settings.language].Videos.Spinner.DownloadingVideos}\x1b[0m <--`
                await execPromise(`"${utils}\\yt-dlp.exe" --ffmpeg-location "${utils}" --yes-playlist -f "bv*+ba/b" --merge-output-format ${format} --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Videos.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Videos/%(uploader)s/%(title)s.%(ext)s" "${url}"`, { maxBuffer: 1024 * 1024 * 50 })
                Spinner.succeed(`--==-- \x1b[32m${language[settings.language].Videos.Spinner.FullDownloads}\x1b[0m --==--`)
                await WaitSeconds(3000)
                console.clear()
            }

            if (Verify.Type == "file") {
                Spinner.color = "yellow"
                Spinner.text = `--> \x1b[32m${language[settings.language].Videos.Spinner.DownloadingVideos}\x1b[0m <--`
                try {
                    await execPromise(`"${utils}\\yt-dlp.exe" --ffmpeg-location "${utils}" -a ${url} --yes-playlist -f "bv*+ba/b" --merge-output-format ${format} --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Videos.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Videos/%(uploader)s/%(title)s.%(ext)s"`, { maxBuffer: 1024 * 1024 * 50 })
                }
                catch {
                    Spinner.fail(language[settings.language].Error.Default)
                    await WaitSeconds(3000)
                    console.clear()
                    if (Retry > 0) {
                        Retry--
                        console.log(`\x1b[37m --==--  \x1b[31m${language[settings.language].Error.Retry}\x1b[37m --==-- \x1b[0m`)
                        await WaitSeconds(3000)
                        console.clear()
                        await WaitSeconds(500)
                        this.DownloadVideos({ format, url })
                    } else {
                        console.log(`\x1b[37m --==--  \x1b[31m${language[settings.language].Error.MaxRetry}\x1b[37m --==-- \x1b[0m`)
                        await WaitSeconds(5000)
                        Retry = 3
                        console.clear()
                    }
                }
                // await execPromise(await execPromise(`"${utils}\\yt-dlp.exe" -a ${url} --ffmpeg-location "${utils}\\ffmpeg.exe" --yes-playlist -f "bv*+ba/b" --merge-output-format ${format} --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Videos.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Videos/%(uploader)s/%(title)s.%(ext)s"`))
                Spinner.succeed(`--==-- \x1b[32m${language[settings.language].Videos.Spinner.FullDownloads}\x1b[0m --==--`)
                await WaitSeconds(3000)
                console.clear()
            }
        }
    },

}