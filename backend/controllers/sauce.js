//@ts-nocheck
const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; //necessaire dans ce projet?
  const sauce = new Sauce({
    ...sauceObject,
    "likes" : 0,
    "dislikes" : 0,
    imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce créée' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(res.status(200).json({ message: 'Sauce modifiée' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({_id:req.params.id})
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`./images/${filename}`, ()=>{
        Sauce.deleteOne({ _id: req.params.id })
        .then(()=>res.status(200).json({ message: 'Sauce supprimée' }))
        .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({_id:req.params.id})
    .then(sauce => {
      //en cours de tests//
      console.log(sauce.likes, sauce.usersLiked, sauce.dislikes, sauce.usersDisliked);
      switch (req.body.like){
        case 1:
          sauce.usersLiked.push(req.body.userId);
          sauce.likes ++;
          break;
        case -1:
          sauce.usersDisliked.push(req.body.userId);
          sauce.dislikes ++;
          break;
        case 0:
          if(sauce.usersLiked.includes(req.body.userId)){
            const index = sauce.usersLiked.indexOf(req.body.userId);
            sauce.usersLiked.splice(index,1);
            sauce.likes --;
          };
          if(sauce.usersDisliked.includes(req.body.userId)){
            const index = sauce.usersDisliked.indexOf(req.body.userId);
            sauce.usersDisliked.splice(index,1);
            sauce.dislikes --;
          };
          break;
      };
      console.log(sauce.likes, sauce.usersLiked, sauce.dislikes, sauce.usersDisliked);
      sauce.save()
        .then(() => res.status(201).json({ message: 'Avis mis à jour' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};