var Posts = new Mongo.Collection('posts');
var writingPost = false;
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

if (Meteor.isClient) {
  Template.body.helpers({
    posts: getPosts,
    writingPost: function(){ return Session.get('writingPost'); }
  });
  
  Template.body.events({
    'click #new-post': toggleNewPost,
    'submit .new-post': submitPost,
    'click .delete': deletePost
  });
  
  Template.registerHelper('formatDate', function(date){
    return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  });
  
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

////////////////////////////////////////////////////////////////////////////////

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
    creationDate: new Date(),
    owner: Meteor.userId(),
    username: Meteor.user().username
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
  var posts = [];
  var currentUserId = Meteor.userId();
  
  if (currentUserId){
    posts = Posts.find({owner: currentUserId}, {sort: {creationDate: -1}});
  } else {
    posts = Posts.find({}, {sort: {creationDate: -1}});
  }
  
  return posts;
}