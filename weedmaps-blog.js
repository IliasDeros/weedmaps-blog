var Posts = new Mongo.Collection('posts');
var writingPost = false;

if (Meteor.isClient) {
  Template.body.helpers({
    posts: getPosts,
    writingPost: function(){ return Session.get('writingPost'); }
  });
  
  Template.body.events({
    'click #new-post': toggleNewPost,
    'submit .new-post': submitPost,
    'click .delete': deletePost
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

// toggle new post creation mode
function toggleNewPost(){
  Session.set('writingPost', writingPost = !writingPost);
}

// submit a new post
function submitPost(e){
  e.preventDefault();
  var title = e.target.title.value;
  var description = e.target.description.value;
  
  // form must be complete
  if (!title.length || !description.length){
    return false;
  }
  
  Posts.insert({
    title: title,
    description: description,
    creationDate: new Date()
  });
  
  // clear posts writing form
  e.target.reset();
  Session.set('writingPost', false);
}

function deletePost(e){
  Posts.remove(this._id);
}

// get a list of all posts
function getPosts(){
  return Posts.find({}, {sort: {creationDate: -1}});
}