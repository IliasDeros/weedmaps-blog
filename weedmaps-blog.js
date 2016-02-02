var Posts = new Mongo.Collection('posts');
var writingPost = false;
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
          'July', 'August', 'September', 'October', 'November', 'December']

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

if (Meteor.isClient) {
  Template.body.helpers({
    posts: getPosts,
    writingPost: function(){ return Session.get('writingPost'); },
  });
  
  Template.body.events({
    'click #new-post': toggleNewPost,
    'submit .new-post': submitPost
  });
  
  Template.post.helpers({
    editingPost: function(){ return Session.get('editingPost') == this._id; }
  });
  
  Template.post.events({
    'click .delete': deletePost,
    'click .edit': editPost,
    'click .edit-post-cancel': cancelEdit,
    'submit .edit-post': updatePost
  });
  
  Template.registerHelper('formatDate', function(date){
    return monthNames[date.getMonth()] 
      + ' ' + date.getDate() + ', ' + date.getFullYear() + ' - ';
  });
  
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
}

////////////////////////////////////////////////////////////////////////////////

// toggle new post creation mode
function toggleNewPost(){
  Session.set('writingPost', writingPost = !writingPost);
}

// leave post edit mode
function cancelEdit(e){
  e.preventDefault();
  
  Session.set('editingPost', null);
}

// update a post if fields are valid
function updatePost(e){
  e.preventDefault();
  
  var newTitle = e.target.title.value;
  var newDescription = e.target.description.value;
  
  // post fields cannot be empty
  if (!newTitle.length || !newDescription.length){
    return false;
  }
  
  Posts.update(this._id, {
    $set: {
      title: newTitle,
      description: newDescription
    }
  });
  
  Session.set('editingPost', null);
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

// delete a post
function deletePost(e){
  Posts.remove(this._id);
}

// toggle post edit mode
function editPost(){
  Session.set('editingPost', this._id);
}

// get a list of all posts
function getPosts(){
  var posts = [];
  var currentUserId = Meteor.userId();
  
  // display only user's posts if currently logged in
  if (currentUserId){
    posts = Posts.find({owner: currentUserId}, {sort: {creationDate: -1}});
  } else {
    posts = Posts.find({}, {sort: {creationDate: -1}});
  }
  
  return posts;
}