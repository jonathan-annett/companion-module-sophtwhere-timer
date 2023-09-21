const fs = require('fs')
const path = require('path')
const JSZip = require('jszip')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const readDir = promisify(fs.readdir)
const lstat = promisify(fs.lstat)

module.exports = {
  generateZipFromFiles,
  createZipFromFiles,
  createZipFile
};

function addFilesToZip (jsZip, directoryPath, filesToInclude, excludeFilter) {

  return  filesToInclude ?  gatherFiles(filesToInclude) : new Promise(function(resolve){

     fs.promises.readdir(directoryPath).then (filterIgnoreDirs).then (resolve);

     function filterIgnoreDirs(filedetails) {
        const filesToInclude = filedetails.filter(function(f){return !f.startsWith('.')});
        return  gatherFiles(filesToInclude);
     }

  });

  function gatherFiles(filesToInclude){

    filesToInclude = excludeFilter ? filesToInclude.filter(excludeFilter) : filesToInclude;

    const promiseArr = filesToInclude.map(async file => {
      const filePath = path.join(directoryPath, file)
      try {
        const fileStats = await lstat(filePath)
        const isDirectory = fileStats.isDirectory()
        if (isDirectory) {
          const directory = jsZip.folder(file)
          const subFiles = await readDir(filePath)
          return addFilesToZip(directory, filePath, subFiles)
        } else {
          const fileContent = await readFile(filePath)
          return jsZip.file(file, fileContent)
        }
      } catch (err) {
        // console.log(err)
        return Promise.resolve()
      }
    })
    return Promise.all(promiseArr)
  };
}

async function createZipFromFiles (directoryPaths, filesToInclude, dontCreateTopLevelFolder = false, excludeFilter=undefined) {
  const jsZip = new JSZip()
  await Promise.all(
    directoryPaths.map(directoryPath => {
      const parsed = path.parse(directoryPath)
      const folder = dontCreateTopLevelFolder ? jsZip : jsZip.folder(parsed.base)
      return addFilesToZip(folder, directoryPath, filesToInclude,excludeFilter)
    })
  )
  return jsZip
}

function generateZipFromFiles (directoryPaths, filesToInclude, outputPath, dontCreateTopLevelFolder = true, excludeFilter = undefined) {
  return new Promise(async (resolve, reject) => {
    const jsZip = await createZipFromFiles(directoryPaths, filesToInclude, dontCreateTopLevelFolder,excludeFilter)
    jsZip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(outputPath))
      .on('finish', () => {
        console.log(`${outputPath} written.`)
        resolve(outputPath)
      })
  })
}

function createZipFile(sourceDir,destZipFilePath,dontCreateTopLevelFolder=false, excludeFilter=undefined) {
  return  generateZipFromFiles ([sourceDir], undefined, destZipFilePath,dontCreateTopLevelFolder,excludeFilter);
}
