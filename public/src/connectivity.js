const { exec } = require("child_process")
const express = require('express')
const p = require("@pinggy/pinggy")
const path = require("path")
const archiver = require("archiver")
const Settings = require('../json/settings.json')
const fs = require("fs")
const App = express()
async function getUrl() {
    const t = await p.pinggy.forward({ forwarding: "localhost:7341" })
    const u = await t.urls()
    return u[0]

}

async function __init__() {
    App.get("/", async (req, res) => {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="Nexus-Files.Zip"`);
        const Path = path.join(__dirname, "../../Download")
        if (fs.existsSync(Path)) {
            const zip = new archiver.ZipArchive({ zlib: { level: 9 } })
            zip.pipe(res)
            zip.directory(Path)
            zip.finalize()
        }
    })

    App.listen(7341, async () => {
        console.log("Starting Server")
    })
}
module.exports = {
    __init__,
    getUrl

}
