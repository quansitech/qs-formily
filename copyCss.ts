import * as glob from "glob"
import * as path from "path"
import * as fs from "fs-extra"

glob('./**/*.less', {cwd: path.resolve(__dirname, './src/components')}, (err, files) => {
    files.forEach(file => {
        const re = /\.\/(\w+\/\w+\.less)/;
        const compPath = re.exec(file)[1];
        if(compPath?.length){
            fs.copy(`${__dirname}/src/components/${compPath}`,`${__dirname}/lib/css/${compPath}`);
        }
        
    })
    
})