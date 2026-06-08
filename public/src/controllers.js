const translation = require("../json/translation.json")
const settings = require("../json/settings.json")
const ora = require("ora")
const path = require("path")
const execPromise = require("util").promisify(require("child_process").exec)
const WaitSeconds = (ms) => new Promise((r) => { setInterval(r, ms * 1000) })
const utils = path.join(__dirname, "../utils")
const Cache = "./Cache"// path.join(__dirname, "../../Cache")
let Data 
let Retry = 3
const CheckURL = async ({ url }) => {
    try {
        const Websites = ['www.youtube.com']
        Data = { Success: false, Type: "", InList: false}
        url.includes('.txt') ? Data.Type = "file" : Data.Type = "text"
        if (url.includes('.txt')) { Data.Success = true; return Data }
        Websites.includes(new URL(url).hostname) ? Data.InList = true : Data.InList = false 
        if (Data.InList) { Data.Success = true; return Data }
        console.clear()
        console.log(`\x1b[37m --==--  \x1b[31m${translation[settings.language].files.noinlist}\x1b[37m --==-- \x1b[0m`)
        await WaitSeconds(10)
        console.clear()
        return Data
    } catch (error) {
        console.clear()
        console.log(`\x1b[37m --==--  \x1b[31m${translation[settings.language].Error.Default}\x1b[37m --==--\x1b[0m`)
        await WaitSeconds(5)
        console.clear()
        return Data
    }
}


async function Youtube(Response, infos) {
    let Command
   
    try {
  
        if (Response.Success) {
               const Spinner = ora.default("").start()

            Spinner.color = "yellow"
            if (infos.type == "Sounds") {
                if (Response.Type == "text") { Command = `"${utils}\\yt-dlp.exe" --yes-playlist -x --audio-format ${infos.format} --ffmpeg-location "${utils}\\ffmpeg.exe" --audio-quality 0 --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Songs.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Songs/%(uploader)s/%(title)s.%(ext)s" "${infos.value}"` }
                if (Response.Type == "file") { Command = `"${utils}\\yt-dlp.exe" -a ${infos.value} --yes-playlist -x --audio-format ${infos.format} --ffmpeg-location "${utils}\\ffmpeg.exe" --audio-quality 0 --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Songs.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Songs/%(uploader)s/%(title)s.%(ext)s"` }
                Spinner.text = `--> \x1b[32m${translation[settings.language].Songs.Spinner.DownloadingSounds}\x1b[0m <--`
                await execPromise(Command, { maxBuffer: 1024 * 1024 * 50 })
                Spinner.succeed(`--==-- \x1b[32m${translation[settings.language].Songs.Spinner.FullDownloads}\x1b[0m --==--`)
                await WaitSeconds(3)
                console.clear()
            }

            if (infos.type == "Videos") {
                if (Response.Type == "text") { Command = `"${utils}\\yt-dlp.exe" --ffmpeg-location "${utils}" --yes-playlist -f "bv*+ba/b" --merge-output-format ${infos.format} --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Videos.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Videos/%(uploader)s/%(title)s.%(ext)s" "${infos.value}"` }
                if (Response.Type == "file") { Command = `"${utils}\\yt-dlp.exe" --ffmpeg-location "${utils}" -a ${infos.value} --yes-playlist -f "bv*+ba/b" --merge-output-format ${infos.format} --embed-thumbnail --embed-metadata --embed-chapters --embed-info-json --convert-thumbnails png --ignore-errors --no-abort-on-error --retries 10 --fragment-retries 10 --download-archive "${Cache}\\Videos.txt" --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 15 -o "Download/Videos/%(uploader)s/%(title)s.%(ext)s"` }
                Spinner.text = `--> \x1b[32m${translation[settings.language].Videos.Spinner.DownloadingVideos}\x1b[0m <--`
                await execPromise(Command, { maxBuffer: 1024 * 1024 * 50 })
                Spinner.succeed(`--==-- \x1b[32m${translation[settings.language].Videos.Spinner.FullDownloads}\x1b[0m --==--`)
                await WaitSeconds(3)
            }

        }
    } catch (error) {
        const Spinner = ora.default("").start()
        await WaitSeconds(3)
        console.clear()
        if (Retry > 0) {
            Retry--
            Spinner.fail(`\x1b[37m --==--  \x1b[31m${translation[settings.language].Error.Retry} ${Retry + 1} / 3 \x1b[37m --==-- \x1b[0m`)
            await WaitSeconds(3)
            console.clear()
            await WaitSeconds(0.5)
            await Donwload(infos)
        } else {
            Spinner.fail(`\x1b[37m --==--  \x1b[31m${translation[settings.language].Error.MaxRetry}\x1b[37m --==-- \x1b[0m`)
            await WaitSeconds(5)
            Retry = 3
            console.clear()
        }
    }
}


async function Donwload(infos) {
    const Response = await CheckURL({ url: infos.value })
      await Youtube(Response, infos)
        console.clear()
}





module.exports = {
    Donwload
}