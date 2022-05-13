const fs = require('fs')
const File = require('../models/File')
const config = require('config');

exports.ceateDir = (file)=>{
    const filePath = config.get('filePath')+'\\'+file.user+'\\'+file.path
    console.log(filePath)
    return new Promise(((resolve,reject)=>{
        try {
            if(!fs.existsSync(filePath)){
                fs.mkdirSync(filePath)
                return resolve({message: 'File was created'})
            }else{
                return reject({message: 'File already exist'})
            }
            
        } catch (error) {
            return reject({message: 'File error'})
        }
    }))
}
exports.deleteFile=(file)=>{
    fs.unlinkSync(file.path+'.'+file.type)
}
exports.updateFile = (file,name)=>{
    const filePathOld = config.get('filePath')+'\\'+file.user+'\\'+file.name+'.'+file.type
    const filePathNew = config.get('filePath')+'\\'+file.user+'\\'+name+'.'+file.type
    return new Promise(((resolve,reject)=>{
        try {
            if(fs.existsSync(filePathOld) && !fs.existsSync(filePathNew)){
                fs.rename(filePathOld,filePathNew,()=>{
                    return "all is ok"
                })
                return resolve({message: 'File was updated'})
            }else if(filePathNew==filePathOld){
                return resolve({message: 'File was updated'})
            }else{
                return reject({message: 'File not found'})
            }
            
        } catch (error) {
            return reject({message: error})
        }
    }))
}