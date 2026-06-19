const fs = require('fs')
const open = require('open')
const path = require('path')
const axios = require('axios')
const inquirer = require("@inquirer/prompts")
const Settings = require("./public/json/Settings.json")
const Controllers = require("./public/src/controllers.js")
const Translation = require("./public/json/Translation.json")
const WaitSeconds = (Seconds) => new Promise((r) => { setTimeout(r, Seconds * 1000) })
const Interface = {
    async ENTER() {
        let Get = await inquirer.select({
            message: Translation[Settings.Language].Get.Message,
            choices: Translation[Settings.Language].Get.Choices.map((name, index) => ({ name: name, value: ["Videos", "Sounds", "Anime", "Books"][index] })),
            theme: {
                prefix: "📁",
                icon: {
                    cursor: "🔵"
                }
            }
        })
        if (this[Get]) { await this[Get]() }
    },

    async Videos() {
        let Format = await inquirer.select({
            message: Translation[Settings.Language].Default.Format.Message,
            choices: [
                { name: 'mp4', value: 'mp4' },
                { name: 'mkv', value: 'mkv' },
            ],
            theme: { prefix: "💠", icon: { cursor: "🟣" } }
        })

        let URL = await inquirer.input({ message: Translation[Settings.Language].Videos.Message, theme: { prefix: "🔗" } })
        let Core = new Controllers({
            Path: URL,
            UserData: {
                Format: Format,
                Type: 'Videos'
            }
        })
        await Core.__init__()
        Core = null

    },

    async Sounds() {
        let Format = await inquirer.select({
            message: Translation[Settings.Language].Default.Format.Message,
            choices: [
                { name: 'mp3', value: 'mp3' },
            ],
            theme: { prefix: "💠", icon: { cursor: "🎵" } }
        })

        let URL = await inquirer.input({ message: Translation[Settings.Language].Videos.Message, theme: { prefix: "🔗" } })
        let Core = new Controllers({
            Path: URL,
            UserData: {
                Format: Format,
                Type: 'Sounds'
            }
        })
        await Core.__init__()
        Core = null

    },

    async Books() {
        const Books = ["📕", "📗", "📘", "📙", "📔", "📒"]
        let Format = await inquirer.select({
            message: Translation[Settings.Language].Default.Format.Message,
            choices: [
                { name: 'png', value: 'png' },
            ],

            theme: { prefix: "💠", icon: { cursor: Books[Math.floor(Math.random() * Books.length)] } }
        })

        let URL = await inquirer.input({ message: Translation[Settings.Language].Book.Message, theme: { prefix: "🔗" } })
        let Core = new Controllers({
            Path: URL,
            UserData: {
                Format: Format,
                Type: ''
            }
        })

        await Core.__init__()
        Core = null

    },

    async Settings() {
        let Options = await inquirer.select({
            message: Translation[Settings.Language].Options.Message,
            choices: Translation[Settings.Language].Options.Choices.map((name, index) => ({ name: name, value: ["OpenCache", "ClearCache", "OpenLogs", "ClearLogs", "ChangeLanguage", "UpdateApplications"][index] })),
            theme: {
                prefix: "⚙️",
                icon: {
                    cursor: "🟡"
                }
            }
        })
        if (this[Options]) { await this[Options]() }
    },

    async OpenCache() {
        open.default(path.join(__dirname, "public", "Cache")).catch(async err => { if (err) { console.log(Translation[Settings.Language].Default.Error.Message) } });
        await WaitSeconds(2.5)
    },

    async ClearCache() {
        await fs.rmSync(path.join(__dirname, "public", "Cache"), { force: true, recursive: true, maxRetries: 3 })
        await WaitSeconds(2.5)
    },

    async OpenLogs() {
        open.default(path.join(__dirname, "public", "Logs")).catch(async err => { if (err) { console.log(Translation[Settings.Language].Default.Error.Message) } });
        await WaitSeconds(2.5)
    },

    async ClearLogs() {
        await fs.rmSync(path.join(__dirname, "public", "Logs"), { force: true, recursive: true, maxRetries: 3 })
        await WaitSeconds(2.5)
    },

    async UpdateApplications() {
        await WaitSeconds(1)
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
                console.log(`--==-- \x1b[32m${Translation[Settings.Language].Update.Completed}\x1b[0m --==--`)
                await WaitSeconds(2)
                process.exit()
            } else {
                console.log(`--==-- \x1b[32m${Translation[Settings.Language].Update["Current Update"]}\x1b[0m --==--`)
            }
        } catch {
            console.log(`\x1b[37m --==--  \x1b[31m${Translation[Settings.Language].Default.Error.Message}\x1b[37m --==--\x1b[0m`)
            await WaitSeconds(3)
            console.clear()
        }
        await WaitSeconds(5)
    },

    async ChangeLanguage() {
        let Data = []
        for (l in Translation) {
            Data.push(l)
        }
        let Select = await inquirer.select({
            message: Translation[Settings.Language].Language.Message,
            choices: Data
        })
        Settings.Language = Select
        fs.writeFileSync(`${path.join(__dirname, "public", "json", "settings.json")}`, `{"Language":"${Select}"}`)
        console.clear()
    },

    async Exit() { process.exit() }

}


async function main() {
    while (true) {
        console.clear()

        let init = await inquirer.select({
            message: Translation[Settings.Language].Home.Message,
            choices: Translation[Settings.Language].Home.Choices.map((name, index) => ({ name: name, value: ["ENTER", "Settings", "Exit"][index] })),
            theme: {
                prefix: "🌐",
                icon: {
                    cursor: "🔴"
                }
            }
        })

        if (Interface[init]) { await Interface[init]() } else { continue }
    }
}

main()