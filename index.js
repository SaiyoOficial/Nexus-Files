const language = require("./public/json/language.json")
const settings = require("./public/json/settings.json")
const controllers = require("./public/src/controllers")
const inquirer = require("@inquirer/prompts")
const fs = require("fs")

async function __init__() {
    let response
    if (!fs.existsSync("./Cache")) { fs.mkdirSync("./Cache", { recursive: true }) }
    if (!fs.existsSync("./Cache/Songs.txt")) { fs.writeFileSync("./Cache/Songs.txt", "", "utf-8") }
    if (!fs.existsSync("./Cache/Videos.txt")) { fs.writeFileSync("./Cache/Videos.txt", "", "utf-8") }

    while (true){
    response = await inquirer.select({
        message: language[settings.language].Home.message,
        choices: language[settings.language].Home.choices.map((name, index) => ({ name: name, value: ["Videos", "Songs", "Anime", "Books"][index] })),
    })
    switch (response) {
            case "Videos":
                format = await inquirer.select({ message: language[settings.language].Videos.FormatMessage, choices: ["mkv","mp4"]})
                url = await inquirer.input({ message: language[settings.language].Videos.message})
                await controllers.DownloadVideos({url,format})
                break

            case "Songs":
                format = await inquirer.select({ message: language[settings.language].Songs.FormatMessage, choices:["mp3"]})
                url = await inquirer.input({ message: language[settings.language].Songs.message})
                await controllers.DownloadSounds({url,format})
                break

            default:
                console.log("Error")
        }
    }




}
 
__init__()