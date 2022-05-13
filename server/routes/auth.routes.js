const Router = require("express")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const router = new Router()
const jwt = require("jsonwebtoken")
const config = require("config")
const {check, validationResult} = require("express-validator")
const authMiddleware = require('../middleware/auth.middleware')
const fileService = require('../service/fileService')
const File = require('../models/File')





//Регистрация
router.post('/registration',
[
    //Валидация
    check('email','Uncorrect email').isEmail(),
    check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3,max:12})
],
async(req,res)=>{
    try {
        //Получаем ошибки валидации
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            //Если есть ошибки  возвращаем 400
            return res.status(400).json({message: "Uncorrect request", errors})
        }
        // Получаем данные из тела запроса
        const {email,password} = req.body
        //Выполняем поиск пользователя в базе данных
        const candidate = await User.findOne({email})
        if(candidate){
            //Если пользователь существует возвращаем ошибку 400
            return res.status(400).json({message: 'User with email ${email} already exist'})
        }
        //Хешируем пароль
        const hashPassword = await bcrypt.hash(password, 6)
        //Создаем нового пользователя
        const user = new User({email, password: hashPassword})
        //Сохраняем пользователя
        await user.save()
        //Создаем папку для файлов
        await fileService.ceateDir(new File({user:user.id, name: ''}))
        return res.json({message:"User was created"})
    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})

router.post('/login',
async(req,res)=>{
    try {
        // Получаем данные из тела запроса
        const {email,password} = req.body
        //Выполняем поиск пользователя в базе данных
        const user = await User.findOne({email})
        if (!user){
            //Если пользователь не найден возвращаем ошибку 400
            return res.status(400).json({message: "User not found"})
        }
        //проверяем совпадение паролей
        const isPasswordValid = bcrypt. compareSync(password, user.password)
        if(!isPasswordValid){
            //Если не совпадают возвращаем ошибку 400
            return res.status(400).json({message: "Invalid password"})
        }
        //Создаём jwt токен
        const token = jwt.sign({id:user.id}, config.get("Secret"),{expiresIn:"1h"})
        return res.json({
            token,
            user:{
                id: user.id,
                email: user.email
            }
        })
    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})


//CRUD for user
router.put('/user',
[
    //Валидация
    check('email','Uncorrect email').isEmail(),
    check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3,max:12})
],
async(req,res)=>{
    try {
        //Получаем ошибки валидации
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            //Если есть ошибки  возвращаем 400
            return res.status(400).json({message: "Uncorrect request", errors})
        }
        const {oldEmail, email, password,role} =req.body
        //Получаем инфу из токена
        const token = req.headers.authorization.split(' ')
        const decoded = jwt.verify(token[1], config.get("Secret"))
        //Поиск пользователя
        const userReq = await  User.findOne({id: decoded.id})
        if(oldEmail == userReq.email || userReq.role=="admin"){
            //Хешируем пароль
        const hashPassword = await bcrypt.hash(password, 6)
        //Создаем нового пользователя
        const user = {email, password: hashPassword,role}
        //Сохраняем пользователя
        let doc = await User.findOneAndUpdate({email: oldEmail},user)
        return res.json({
            message:"User was updated",
            result: doc
        })
        }
        return res.json({message: "Access denied"})
    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})

router.delete('/user',
async(req,res)=>{
    try {
        const email = req.email
        const token = req.headers.authorization.split(' ')
        const decoded = jwt.verify(token[1], config.get("Secret"))
        const userReq = await  User.findOne({id: decoded.id})
        if(email == userReq.email || userReq.role=="admin"){
            User.deleteOne({email: email})
            return res.json("User deleted")
        }
        return res.json({message: "Access denied"})
    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})


router.get('/auth', authMiddleware,
async(req,res)=>{
    try {
        const user = await User.findOne({_id: req.user.id})
        const token = jwt.sign({id:user.id}, config.get("Secret"),{expiresIn:"1h"})
        return res.json({
            token,
            user:{
                id: user.id,
                email: user.email
            }
        })
    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})
module.exports = router