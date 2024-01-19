import express from 'express'
import cookieParser from 'cookie-parser';
import path from 'path';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const app = express();

mongoose.connect('mongodb://localhost:27017/form1', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Connected to database');
}).catch((err)=>{    
    console.log(err);
})

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const userModel = new mongoose.model('user',userSchema);



//middlewares to get the data from post request and show it on console
app.use(express.urlencoded({extended: true}));
////middle ware to use public files like css, js, images
app.use(express.static(path.join(path.resolve(), 'public')));
//decode cookie
app.use(cookieParser());


app.set('view engine', 'ejs');

const isAuthentic = async (req,res,next) => {
    
    const token = req.cookies.token
    if(token){
        //decoding the token to match with id
        const decode = jwt.verify(token,"secretkey");
        req.user = await userModel.findById(decode._id);
        const getuserid = await userModel.findById(decode._id);
        console.log(getuserid);

        next();
    }else{
        res.render('register');
       
    }
}

app.get('/',isAuthentic, (req,res) => {
    // const token = req.cookies.token; // Remove this line
    //or const {token} = req.cookies; // Remove this line
   
    res.render('logout',{name:req.user.name});
    // console.log(req.cookies); 
    /*
NOTE : it will  show undefine now to see cookie we need to install cookie-parser
to install cookie-parser run command : npm install cookie-parser
    */
    
})

app.get('/register', (req,res) => {
    console.log("the registre process is started")
    console.log("cookies from regisert" + req.cookies);
    res.render('register');

})

app.post('/register ', async (req,res) => {
   
    //destructuring
    const {name,email,password} = req.body;

    console.log(req.body);

    let user = await userModel.findOne({email});
    // console.log("the email i found is" + user);
    if(user){
        
        return res.redirect('/login');
    }

    
    
    user = await userModel.create({
        // name:req.body.name,
        //name : name,
        // name
        name,
        email,
        password,
    })

    console.log(user);

    const token = jwt.sign({_id :user._id},"secretkey")
    res.cookie('token',token,{
        httpOnly: true,
        expires: new Date(Date.now()+ 60000)
    });
    // console.log(token);
    res.redirect('/');
    //console.log(req.body);
})

app.get('/login',(req,res) => {
    res.render('login');
})


app.get('/logout', (req,res) => {
    res.cookie('token',null,{
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.redirect('/');
})


app.listen(3030, () => {
    console.log('Server is running on port 3030');
})