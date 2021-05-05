require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos  - to get latest images
///manifests/rover_name - to get rovers data

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover/:name/images', async (req, res) => {
    let roverName = req.params.name;
    try {
        let images = await fetch(
					`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/latest_photos?api_key=${process.env.API_KEY}`
				).then((res) => res.json());
        res.send(images.latest_photos)
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover/:name/info', async (req, res) => {
    let roverName = req.params.name;
    try {
        let data = await fetch(
					`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`
				).then((res) => res.json());
        res.send(data.photo_manifest);
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))