const path = require("path")
const translation = require("./public/json/translation.json")
const settings = require("./public/json/settings.json")
const controllers = require("./public/src/controllers")
const inquirer = require("@inquirer/prompts")
const fs = require("fs")

async function __init__() {
    let response
    while (true) {
        new Promise((resolver,reject)=>{setInterval(()=>{
          if (!fs.existsSync("./Cache")) { fs.mkdirSync("./Cache", { recursive: true }) }
        if (!fs.existsSync("./Cache/Songs.txt")) { fs.writeFileSync("./Cache/Songs.txt", "", "utf-8") }
        if (!fs.existsSync("./Cache/Videos.txt")) { fs.writeFileSync("./Cache/Videos.txt", "", "utf-8") }
        },1000)})
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
                await controllers.Donwload({ value, format ,type:"Videos"})
                break

            case "Songs":
                format = await inquirer.select({ message: translation[settings.language].Songs.FormatMessage, choices: ["mp3"] })
                value = await inquirer.input({ message: translation[settings.language].Songs.message })
                await controllers.Donwload({ value, format, type:"Sounds" })
                break

            default:
                console.log(translation[settings.language].Error.Default)
        }
    }




}

__init__()