//@ts-nocheck
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cryptojs = require('crypto-js/hmac-sha512');

exports.signup = (req, res, next) => {
  const emailCryptoJs = cryptojs(req.body.email, `${process.env.CRYPTOJS}`).toString();
  const regex = 123;
  // à remplacer par /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; //Mini 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character in @$!%*?&
  const pass = req.body.password;
    if(pass.match(regex)){
      bcrypt.hash(pass, 10)
        .then(hash => {       
            const user = new User({
              email: emailCryptoJs,
              password:hash   
          });
          user.save()
            .then(()=> res.status(201).json({message:'Utilisateur créé'}))
            .catch(error => res.status(400).json({error}));

        })
        .catch(error => res.status(500).json({error}));
    } else {
        throw new Error("Le mot de passe n'est pas assez sécurisé (min 8 carac dont 1 majuscule, 1 minuscule, 1 nombre et 1 caractère spécial (@$!%*?&)")
 }
};

exports.login = (req, res, next) => {
  const emailCryptoJs = cryptojs(req.body.email, `${process.env.CRYPTOJS}`).toString();
  //search in database if user exist
  User.findOne({email:emailCryptoJs})
    .then(user=>{
      if (!user){
        return res.status(401).json({error:'Utilisateur non trouvé!'})
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid){
            return res.status(401).json({error:'Mot de passe incorrect!'})
          }
          res.status(200).json({
            userId: user._id,
            token:jwt.sign(
              {userId : user._id},
              process.env.APP_SECRET,
              {expiresIn : '24h'} 
            )
          });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};