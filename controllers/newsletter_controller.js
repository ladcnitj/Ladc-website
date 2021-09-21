const transporter=require('../config/mailing')
const Subscribers=require('../models/newsletter');



home = function(req,res){
    if (req.isAuthenticated()) 
    {
    if(req.query.msg)
    {
    return res.render('newsletter',{
        title:"Newsletter",errormsg:req.query.msg
    });
}
else
{
     return res.render('newsletter',{
        title:"Newsletter",errormsg:""
    });
}
}
else
{
    res.redirect('/');
}
}

// console.log(Subscribers)
subscribe=function(req,res,next){
    
console.log(req.body.name);
        Subscribers.create({name:req.body.name,email:req.body.email},(err)=>{
            if(err)
            {
                if(err.name==='MongoError'&&err.code===11000)
                {
                  
                   res.jsonp({msg:"This email is already registered"});
                }
                else
                {
                    res.jsonp({msg:"Internal error occurred, Try again"});
                }
            }
            else
            res.jsonp({msg:"Successfully Registered"});
          
        }); 
}

un_subscribe=function(req,res,next){
    Subscribers.deleteOne({email:req.body.email}).then(function(){
        res.send("You Have been successfully unsubscribed");
    }).catch(function(err){
        console.log(err);
        res.send("Some Error occurred");
    })
}

async function sendMail(user,req){
    let info = await transporter.sendMail({
        from: 'ladc@nitj.ac.in', // sender address
        to: user.email, // list of receivers
        subject: "LADC NewsLetter", // Subject line
        html:` <body style="border:2px solid rgb(14, 88, 93); ">
        <div style="text-align: center;height:10%; padding-bottom: 20px;">
        <img src="https://i.ibb.co/VYw8sTx/ladclogo.png" alt="" style="height:50%;">
        <hr style="width: 70%; margin-top: -3%; color: #0e585d;">
        <h1 style="text-align: center; margin-top:0px; color: rgb(14, 88, 93); font-family: cursive;">What's happening in LADC? </h1>
    </div>
       <div style=" padding-left: 15px; padding-right: 15px; margin-bottom: 10%; margin-left: 30px; margin-right: 30px;">
        <p style="font-family: Arial, Helvetica, sans-serif; font-weight:900; text-align: center; ">
          Hi ${user.name}, Here we are with our next Newsletter.
    
          </p>
          <p style="font-family: Arial, Helvetica, sans-serif; font-weight:500; ">
           ${req.body.newslettercontent}
         
       </p>
       </div>
       <div style="background-color: #0e585d; text-align: center; padding: 1.5%;">
        <form action="http://localhost:8000/unsubscribe" method="POST">
          <input style="display: none;" type="text" name="email" id="email" value="${user.email}">
       <button type="submit" style="background: none!important;border: none; padding: 0!important; text-decoration: underline;cursor: pointer; color: rgba(165, 165, 165, 0.801);" >Unsubscribe from newsletter</button>
      </form>
       </div>
   
    </body>`
      });
console.log('email sent');
}

postnewsletter=function(req,res){
    if (!req.isAuthenticated())
    return res.redirect('/');

    Subscribers.find({},(err,result)=>{
        if(err)
        return console.log(err)
        
        for(let i=0;i<result.length;i++){
           
                sendMail(result[i],req).catch(e=>{
                    console.log(e.message);
                });  
        
            
            }

    })
    
    res.redirect('/admin/newsletter');
}

module.exports={
    home,
    subscribe,
    un_subscribe,
    postnewsletter
};