const { createHmac, randomBytes } = require('crypto')

const { Schema,model } = require('mongoose')

const userSchema = new Schema({
 fullName:{
    type:String,
    required:true,
    unique:true,
 },
 email:{
    type:String,
    required:true,
    unique:true,
 },
 random:{
    type: String,
 },
 password:{
    type:String,
    required:true,
 },
 profileImageURL:{
    type:String,
    default : "/images/download.png",

 }, 
 role :{
    type : String,
    enum: ["USER", "ADMIN"],
    default: "USER",
   },
 
 },
{timestamps:true}
);

userSchema.pre("save", function (next){
    const user = this;
    if(!user.isModified("password")) return;

    const random = randomBytes(16).toString();
    const hashedpassword = createHmac('sha256',random)
    .update(user.password)
    .digest("hex");
    this.random = random;
    this.password = hashedpassword;

    next();

});
 
userSchema.static('matchPassword', async function(email,password){
const user = await this.findOne({email});
if(!user) throw new Error('User Not Found');

const random = user.random;
const hashedpassword = user.password;

const userProvidedHash= createHmac('sha256',random)
.update(password)
.digest("hex");
if(hashedpassword!== userProvidedHash) throw new Error ('Incorrect Password');

return user;
});

const User = model("user", userSchema);
module.exports= User;
