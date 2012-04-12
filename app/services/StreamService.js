/*
 *  Copyright 2012 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var twitter = require('ntwitter')
var io      = require('socket.io').listen(app)
    io.set('log level', 1)

module.exports = require(app.set('services') + '/BaseService').extend(function () {
  this.twttr = new twitter({
      consumer_key: this.config.twitter_app.consumer_key
    , consumer_secret: this.config.twitter_app.consumer_secret
    , access_token_key: this.config.twitter_app.access_token_key
    , access_token_secret: this.config.twitter_app.access_token_secret
  })
  
  this.stream_active = false
  this.account_details = {
      id_str: this.config.twitter_account.id
    , screen_name: this.config.twitter_account.screen_name
  }

  this.moderators = [
    {
        id_str: this.config.twitter_account.id
      , screen_name: this.config.twitter_account.screen_name
    }
  ]
  v.each(this.config.moderators, function(moderator) {
    this.moderators.push(moderator)
  }.bind(this))
  
  this.blacklist = this.config.blacklist
  
  this.account_statuses = []
  this.model = this.getModel('Favorites')
  this.socket = {}

})
  .methods({

    init: function () {
      this.start();
    }
  , start: function () {
      this.initTimeline()
      this.initStream()
      this.initSockets()
    }
    
  , initTimeline: function () {
      this.twttr.getUserTimeline({user_id:this.account_details.id_str, count:200, include_entities: true}, function(err, data){
        this.account_statuses = data;
        console.log(err)
      }.bind(this));    
    }
    
  , initStream: function () {
    
      this.stream_active = true;

      this.twttr
        .stream('user', {track:this.account_details.screen_name, replies:'all', include_entities: true}, function(stream) {

          stream.on('data', function (data){
            console.dir(data)
            this.handleData(data);
          }.bind(this));
          
          stream.on('delete', function(data){
            console.dir(data)
            this.initTimeline()
            this.pushDelete(data)
          }.bind(this))

          stream.on('end', function (resp) {
            console.log('disconnected from twitter: ' + resp.statusCode);
            this.start();
            this.stream_active = false;
          }.bind(this));

          stream.on('destroy', function (resp) {
            console.log('disconnected by twitter: ' + resp.statusCode);
            this.start();
            this.stream_active = false;
          }.bind(this));

          stream.on('error', function (obj) {
            console.log('error: ', obj);
          });

        }.bind(this));
  
    }
    
  , initSockets: function () {
    io.sockets
      .on('connection', function (socket){
        console.log('THE SOCKET CONNECTED!' + socket);
        this.socket = socket;
      }.bind(this))
  }

  , handleData: function (data) {
      switch (data.event){
        case 'favorite':
          console.log('event is favorite')
          this.addFavorite(data)
          break
        case 'unfavorite':
          console.log('event is unfavorite')
          this.removeFavorite(data)
          break
        default:
          this.filter(data)
      }
    }
    
  , getFeed: function (callback) {
    // query REST API on load for all previous tweets, push to array
    callback(this.account_statuses)
  }
  
  , refreshFeed: function (callback) {
    this.initTimeline()
    callback({status: 'refresh requested'})
  }
  
  , getFavorites: function (callback) {
    this.model.getFavorites(function(err, doc) {
      callback(doc)
    })
  }
  , getFavorite: function (id, callback) {
    this.model.getFavorite(id, function (err, obj) {
      callback(err, obj)
    });
  }
  , getQuestions: function (callback) {
    this.model.getQuestions(function(err, doc) {
      callback(doc)
    })
  }
  , addFavorite: function(data) {
    // if a favorite and exists in the database, add user to its favorites array
    // else push as an item to the database, setting user in its favorites array
    this.getFavorite(data.target_object.id_str, function (err, fav) {
      
      // check if any moderator favorites, if so, pass marked as true
      // var marked = (data.source.id_str === this.moderator.id_str) ? true : null
      var marked = null;
      v.each(this.moderators, function (moderator) {
        if(data.source.id_str === moderator.id_str){
          marked = true
        }
      })
      
      if(fav){
        console.log('fav to add: ' + fav)
        this.model.add(data.source, fav, marked, function(err, doc) {
          console.log('added to model ', doc)
          this.pushFavorite(err, doc)
        }.bind(this))
      } else {
        console.log('fav to create: '+fav)
        this.model.create(data.source, data.target_object, marked, function(err, doc) {
          console.log('created model ', doc)
          this.pushFavorite(err, doc)
        }.bind(this))
      }
    }.bind(this))
  }
  
  , removeFavorite: function (data) {
    // if unfavorited and exists in the database, remove user from favorites array  
    this.getFavorite(data.target_object.id_str, function (err, fav) {
      if(fav){      
        console.log('fav to remove: ' + fav)
        // var marked = (data.source.id_str === this.moderator.id_str) ? false : null
        var marked = null;
        v.each(this.moderators, function (moderator) {
          if(data.source.id_str === moderator.id_str){
            marked = false
          }
        })
        
        this.model.remove(data.source, fav, marked, function(err, doc) {
          this.pushFavorite(err, doc)
        }.bind(this))
      }
    }.bind(this))
  }
  
  // FILTER FOR REPLIES
  , filter: function (data) {
      
      var blocked = false
      v.each(this.blacklist, function (blacklisted) {
        if(data.user.id_str === blacklisted.id_str){
          blocked = true
        }
      })
      
      // don't post if the user has been blacklisted
      if(!blocked){
        // if a reply, take text str, strip username, repost as new tweet with author username
        if (data.in_reply_to_user_id_str &&
            data.in_reply_to_user_id_str === this.account_details.id_str) {
        
          var prefix = new RegExp('@'+this.account_details.screen_name+'[:\\s]?[\\-–—]?\\s*')
            , text_str = data.text.replace(prefix, '')
            , new_text_str = 'From @'+data.user.screen_name+': '+text_str;
          
          if(new_text_str.length > 140){
            new_text_str = new_text_str.slice(0,139)
            new_text_str += '…'
          }

          var status_id = data.id_str;

          this.twttr.updateStatus(new_text_str, {in_reply_to_status_id: status_id}, function (err, data){
            if(err) {
              return console.log('error on posting: '+err);
            }
            // prepend tweet to array to maintain reverse chronological order
            this.account_statuses.splice(0,0,data);
            this.pushTweet(data);
          
          }.bind(this));
        }
      }
    }

  , pushTweet: function (tweet) {
      this.socket.emit('tweet', tweet)
    }
  , pushDelete: function (tweet) {
      console.log('emit deletion')
      setTimeout(function(){
        this.socket.emit('deletion', tweet)
      }.bind(this), 3000)
    }
  , pushFavorite: function (err, fav) {
      if (fav.marked === true){
        this.socket.emit('selected', fav)
      }
      if (fav === 1) {
        this.socket.emit('deselected')
      }
      this.socket.emit('favorite', fav)
    }
  
  })