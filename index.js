const path = require("path")
const translation = require("./public/json/translation.json")
const settings = require("./public/json/settings.json")
const controllers = require("./public/src/controllers")
const inquirer = require("@inquirer/prompts")
const axios = require("axios")
const fs = require("fs")
const WaitSeconds = (ms) => new Promise((r) => { setInterval(r, ms * 1000) })
async function __init__() {
    let response
    while (true) {
        new Promise((resolver, reject) => {
            setInterval(() => {
                if (!fs.existsSync("./Cache")) { fs.mkdirSync("./Cache", { recursive: true }) }
                if (!fs.existsSync("./Cache/Songs.txt")) { fs.writeFileSync("./Cache/Songs.txt", "", "utf-8") }
                if (!fs.existsSync("./Cache/Videos.txt")) { fs.writeFileSync("./Cache/Videos.txt", "", "utf-8") }
            }, 1000)
        })
        let init = await inquirer.select({
            message: translation[settings.language].Init.message,
            choices: translation[settings.language].Init.choices.map((name, index) => ({ name: name, value: ["ENTER", "Settings"][index] }))
        })
        if (init == "Settings") {
            console.clear()
            let Settings = await inquirer.select({
                message: translation[settings.language].Settings.message,
                choices: translation[settings.language].Settings.choices.map((name, index) => ({ name: name, value: ["Language", "Additional settings"][index] }))
            })

            if (Settings == "Additional settings") {
                let AdSettings = await inquirer.select({
                    message: translation[settings.language].AdSettings.message,
                    choices: translation[settings.language].AdSettings.choices.map((name, index) => ({ name: name, value: ["Clear cache", "Update application"][index] }))
                })



                if (AdSettings == "Clear cache") {
                    fs.rmSync("./Cache", { force: true, recursive: true, maxRetries: 3 })
                    console.log(`--==-- \x1b[32m${translation[settings.language].Cache.Completed}\x1b[0m --==--`)
                }
                if (AdSettings == "Update application") {

                    try {
                        const releases = await axios.get(`https://api.github.com/repos/SaiyoOficial/Nexus-Files/releases/latest`)
                        const CurrentVersion = require("./package.json").version
                        const NewVersion = releases.data.tag_name
                        if (`V${CurrentVersion}` != NewVersion) {
                            const File = await axios.get(`https://github.com/SaiyoOficial/Nexus-Files/releases/download/${NewVersion}/Nexus-files.exe`, {
                                responseType: "arraybuffer",
                                onDownloadProgress: (progressEvent) => {
                                    console.clear()
                                    console.log(`--==-- \x1b[32m${Math.floor(Math.round(progressEvent.loaded * 100) / progressEvent.total)}% \x1b[0m --==--`)
                                }
                            })
                            await WaitSeconds(1.5)
                            console.clear()
                            fs.renameSync("./Nexus-files.exe", "./Nexus-files.old.exe")
                            fs.writeFileSync("./Nexus-files.exe", File.data)
                            console.log(`--==-- \x1b[32m${translation[settings.language].Update.Completed}\x1b[0m --==--`)
                            await WaitSeconds(2)
                            process.exit()
                        } else {
                            console.log(`--==-- \x1b[32m${translation[settings.language].Update["Current Update"]}\x1b[0m --==--`)
                        }
                    } catch {
                        console.log(`\x1b[37m --==--  \x1b[31m${translation[settings.language].Error.Default}\x1b[37m --==--\x1b[0m`)
                            await WaitSeconds(1.5)
                            console.clear()
                    }

                    

                }


                continue
            }






            if (Settings == "Language") {
                let Data = []
                for (l in translation) {
                    Data.push(l)
                }
                let LanguageSelect = await inquirer.select({
                    message: translation[settings.language].Language.message,
                    choices: Data
                })
                settings.language = LanguageSelect
                fs.writeFileSync(`${path.join(__dirname, "public", "json", "settings.json")}`, `{"language":"${LanguageSelect}"}`)
                console.clear()
                continue
            }
        }

        response = await inquirer.select({
            message: translation[settings.language].Home.message,
            choices: translation[settings.language].Home.choices.map((name, index) => ({ name: name, value: ["Videos", "Songs", "Anime", "Books"][index] })),
        })
        switch (response) {
            case "Videos":
                format = await inquirer.select({ message: translation[settings.language].Videos.FormatMessage, choices: ["mkv", "mp4"] })
                value = await inquirer.input({ message: translation[settings.language].Videos.message })
                await controllers.Donwload({ value, format, type: "Videos" })
                break

            case "Songs":
                format = await inquirer.select({ message: translation[settings.language].Songs.FormatMessage, choices: ["mp3"] })
                value = await inquirer.input({ message: translation[settings.language].Songs.message })
                await controllers.Donwload({ value, format, type: "Sounds" })
                break

            default:
                console.log(translation[settings.language].Error.Default)
        }
    }




}

__init__()