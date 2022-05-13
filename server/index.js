const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const app = express()
const PORT = process.env.PORT || config.get('serverPort')
const fileUpload = require("express-fileupload")
const corsMiddleware = require("./middleware/cors.middleware")
const filepathMiddleware = require("./middleware/filepath.middleware")
const fileRouter = require("./routes/file.routes")
const authRouter = require("./routes/auth.routes")
const path = request('path')

app.use(fileUpload({}))
app.use(corsMiddleware)
app.use(filepathMiddleware(path.resolve(__dirname,'files')))
app.use(express.json())
app.use(express.static('files'));
app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)


const start =  async () =>{
    try{
        await mongoose.connect(config.get("dbUrl"))
        app.listen(PORT,()=>{
            console.log('Server started on port', PORT)
        })
    }catch (e){

    }
}
start()