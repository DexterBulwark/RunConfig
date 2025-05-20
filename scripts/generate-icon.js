const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../images/icon.svg');
const pngPath = path.join(__dirname, '../images/icon.png');

// Read the SVG file
const svgBuffer = fs.readFileSync(svgPath);

// Convert SVG to PNG
sharp(svgBuffer)
    .resize(128, 128)
    .png()
    .toFile(pngPath)
    .then(() => {
        console.log('Icon generated successfully!');
    })
    .catch(err => {
        console.error('Error generating icon:', err);
    }); 