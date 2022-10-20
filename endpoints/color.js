const router = require('express').Router();

const request = require('node-superfetch');
const colorJson = require('../assets/colornames.json')
const isImageUrl = require('is-image-url');

module.exports = async (req, res) => {
    if (req.query.input === undefined) return res.status(400).send({ success: false, message: "Bad Request 400: No Color Input Specified", data: null })
    
    let input = req.query.input;

    console.log(input);

    if (input.match(/^#[0-9A-Fa-f]{6}$/i) || input.match(/^[0-9A-Fa-f]{6}$/i)) {
        if (input.startsWith("#")) input.substring(1);
        
        let colorData = colorJson.filter(color => color.hexCode && color.hexCode == input.toLowerCase());
        
        console.log(`colorData: ${colorData}`)

        let { body: color } = await request.get(`https://www.thecolorapi.com/id?hex=${colorData[0] ? colorData[0].hexCode : input}&format=json`);
    
        let jsonBody = {
            name: colorData[0] ? colorData[0].bestName : color.name.value,
            hex: color.hex.value,
            rgb: color.rgb.value,
            hsl: color.hsl.value,
            hsv: color.hsv.value,
            cmyk: color.cmyk.value,
            xyz: color.XYZ.value,
            image: color.image.bare
        }

        return res.send({ success: true, body: jsonBody, ext: null});
    } else {
        
        try {
            let colorData = colorJson.filter(color => color.bestName.toLowerCase() == input.toLowerCase());

            let { body: color } = await request.get(`https://www.thecolorapi.com/id?hex=${colorData[0].hexCode}&format=json`);
        
            let jsonBody = {
                name: colorData[0].bestName,
                hex: color.hex.value,
                rgb: color.rgb.value,
                hsl: color.hsl.value,
                hsv: color.hsv.value,
                cmyk: color.cmyk.value,
                xyz: color.XYZ.value,
                image: color.image.bare
            }
    
            return res.send({ success: true, body: jsonBody, ext: null});
        } catch {
            return res.send({success: false, message: "This color either doesnt exist or is invalid." })
        }
    }
}