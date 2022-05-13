const FileService = require('../service/fileService')
const User = require('../models/User')
const config = require("config")
const fs = require("fs")
const File = require('../models/File')

exports.create = async (req,res)=>{
    try {
        const {name,type}=req.body
        const file = new File({name,type, user: req.user.id})
        file.path = name
        await FileService.ceateDir(req,file)
        await file.save()
        return res.json(file)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
}
exports.getFiles = async(req,res)=>{
    try {
        console.log(req.user)
        const files = await File.find({user: req.user.id})
        return res.json(files)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "It can't get files"})
    }
}
exports.getAllFiles = async(req,res)=>{
    try {
        console.log(req.user)
        const files = await File.find()
        return res.json(files)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "It can't get files"})
    }
}
exports.uploadFile = async(req,res)=>{
    try {
        const file = req.files.file
        const user = await User.findOne({_id: req.user.id})
        if (user.usedSpace + file.size> user.diskSpace){
            return res.status(400).json({message: "There is no space on disk"})
        }
        user.usedSpace = user.usedSpace+file.size
        let path
        path = req.filePath+'\\'+user.id+'\\'+file.name
        if (fs.existsSync(path)){
            return res.status(400).json({message: "File already exist"})
        }
        file.mv(path)
        const data=file.name.split('.')
        const type = data.pop()
        const dbFile = new File({
            name: data.pop(),
            type,
            size: file.size,
            path,
            user: user.id
        })
        await dbFile.save()
        await user.save()
        res.json(dbFile)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
}
exports.downloadFile = async(req, res)=> {
    try {
        const file = await File.findOne({name: req.params.idFile})
        var filepath = 'C:\\Users\\voham\\OneDrive\\Рабочий стол\\Sem6\\CurseWork\\basket-gallery\\server\\files\\'+req.params.idUser+'\\'+req.params.idFile+'.'+file.type
        res.sendFile(filepath);
    } catch (e) {
        return res.status(400).json(e)
    }
}
exports.deleteFile=async(req,res)=>{
    try {
        const file = await File.findOne({name:req.params.idFile,user:req.user.id})
        if (!file){
            return res.status(400).json({message:'file not found'})
        }
        else{
            FileService.deleteFile(req,file)
            await file.remove()
            return res.json({message:'File was delete'})
        }
    } catch (e) {
        console.log(e)
    }
}
exports.LikeViews=async(req,res)=>{
    try {
        const {action}=req.body
        console.log(action)
        const file = await File.findOne({name:req.params.idFile,user:req.params.idUser})
        if(file==null){return res.status(400).json({message:'File Not Found: '})}
        if(action=='0'){
            file.likes=file.likes-1
            file.save()
            return res.json({message:'Like Off'})
        }else if(action=='1'){
            file.likes=file.likes+1
                file.save()
                return res.json({message:'Like On'})
        }else if(action=='2'){
            file.views=file.views+1
            file.save()
            return res.json({message:file.views})
        }else{
            return res.status(400).json({message:'Unknown command'})
        }
    } catch (e) {
        console.log(e)
    }
}
exports.updateFile = async(req,res)=>{
    try {
        const {name,tags}=req.body
        const file = await File.findOne({name:req.params.idFile,user:req.params.idUser})
        if(!file){
            return res.status(400).json({message:'File Not Found'})
        }
        await FileService.updateFile(req,file,name)
        file.name=name
        file.tags=tags
        file.path=req.filePath+'\\'+req.user.id+'\\'+file.name
        file.save()
        return res.json(file)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "It can't update file"})
    }
}
exports.publish = async(req,res)=>{
    try {
        const file = await File.findOne({name:req.params.idFile,user:req.user.id})
        if(!file){
            return res.status(400).json({message:'File Not Found'})
        }
        console.log('AAAAA '+file.status)
        if(file.status==0){
            file.status=1
            file.save()
            return res.json({message: "The file changed on public"})
        }else{
            file.status=0
            file.save()
            return res.json({message: "The file changed on unpublic"})
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "It can't publish file"})
    }
}