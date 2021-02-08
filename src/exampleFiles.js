var path = require('path'), 
    fs   = require('fs');

function getFilesFromPath(path, extension) {
    let files = fs.readdirSync( path );
    return files.filter( file => file.match(new RegExp(`.*\.(${extension})`, 'ig')));
}

console.log(getFilesFromPath("../src/labs", ".rdp"));