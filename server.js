require(`dotenv`).config()
const express = require(`express`)
const app = express()
const path = require(`path`)
const errorHandler = require(`./middleware/errorHandler`)
const cookieParser = require(`cookie-parser`)
const {logger, logEvents} = require(`./middleware/logger`)
const cors = require(`cors`)
const bodyParser = require('body-parser');
const corsOptions = require(`./config/corsOptions`)
const connectDB = require(`./config/dbConn`)
const mongoose = require(`mongoose`)
const PORT = process.env.PORT || 3500



connectDB()

app.use(logger)


app.use(cors(corsOptions))

// app.use(express.json())
app.use(express.json({ limit: '40mb' }));

app.use(cookieParser())

app.use(`/`, express.static(path.join(__dirname, `public`)))

app.use(`/`, require(`./routes/root`))
app.use(`/auth`, require(`./routes/authRoutes`))
app.use(`/user`, require(`./routes/userRoutes`))
app.use(`/posts`, require(`./routes/postRoutes`))
app.use(`/comment`, require(`./routes/commentRoutes`))
app.use(`/search`, require(`./routes/searchRoutes`))



app.all(`*`, (req, res) => {
    res.status(404)
    if(req.accepts(`html`)){
        res.sendFile(path.join(__dirname, `views`, `404.html`))
    } else if(req.accepts(`json`)){
        res.json({message: `404 Not Found`})
    } else {
        res.type(`txt`).send(`404 Not Found`)
    }
})

app.use(errorHandler)


mongoose.connection.once(`open`, _ =>{
    console.log(`Connected to MongoDB`)
    app.listen(PORT, () => {
        console.log(`Server running on PORT ${PORT}`)
    })
})

mongoose.connection.on(`error`, err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

