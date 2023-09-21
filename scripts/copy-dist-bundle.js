const fs = require('fs');
const path = require('path');
const package_name = require (path.join (__dirname,'..','package.json')).name;
const src = path.join (__dirname,'..','pkg');
const zipfile_src =  path.join (__dirname,'..','dist-src');

const dest = path.join (zipfile_src,'bundled-modules',package_name);

const test_config_src  = path.join (__dirname,'default-tests.companionconfig');
const test_config_dest = path.join (zipfile_src,'default-tests.companionconfig');


const zipfile_out =  path.join (__dirname,'..','dist',package_name+'.zip');

const readme_path = path.join (zipfile_src,'readme.md');
const readme_text = `${package_name} beta test installation procedure
---

To install **${package_name}** for beta testing, first have a functional companion install 

This release has been tessted against \`companion-win64-3.0.1+6068-stable-a05a9c89.exe\`

You can download Companion from https://user.bitfocus.io/download

Note - downloads require a free registration/login  from https://user.bitfocus.io/login 

Once you have installed Companion, you need to locate the  \`bundled-modules\` folder 

For example the default location on a Windows installation is something like 

    \`C:\\Program Files\\Companion\\resources\\bundled-modules\`

If you're reading this help file, the assumption is that you've already downloaded and extracted the zip file that this help file lives in. 

That being the case, you should have noticed that alongside this file there is a folder called  \`bundled-modules\` which has a single folder inside it, called \`${package_name}\`

Your goal is to drag or copy/paste the \`${package_name}\` from inside the \`bundled-modules\` that was in the zip file, into the \`bundled-modules\` of your Companion installation

And that's it!

When you restart Companion, the **${package_name.replace('-',':')}** connection will exist in Companion.

To get you started, there's a page of test buttons pre-configured in the \`default-tests.companionconfig\` file, which you can import to a page in your Companion surface

`;


const { createZipFile } = require('./generate-zip-from-files');


if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {

    if (fs.existsSync(dest)) {
        if (fs.statSync(dest).isDirectory()) {
            fs.rmSync(dest,{ recursive: true, force: true });
        } else {
            fs.unlinkSync(dest,{  force: true });
        }
    } 
    
    fs.mkdirSync(dest,{recursive:true});
    fs.cpSync(src, dest, {recursive: true});

    fs.cpSync(test_config_src, test_config_dest);

    fs.writeFileSync(readme_path,readme_text);

    createZipFile (zipfile_src, zipfile_out, true, function(fn){
        return !fn.endsWith('.zip');
    } );
}

