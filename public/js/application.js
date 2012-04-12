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

var Ospriet = Ospriet || {};

!function(exports) {
  
  var Timeline  = {}
    , TopTweets = {}
    , CurrentQuestion = {}
    , mixins = {}
    , refresh_interval
    , updated = new Date();
    
  exports.socket = io.connect('/', {
    'connect timeout': 5000,
    'reconnect': true,
    'reconnection delay': 500,
    'reopen delay': 500,
    'max reconnection attempts': 10
  });
  
  exports.init = function () {    
    
    moment.relativeTime = {
        future: "in %s",
        past: "%s",
        s: "%ds",
        m: "1m",
        mm: "%dm",
        h: "1h",
        hh: "%dh",
        d: "1 day ago",
        dd: "%d days ago",
        M: "1 month ago",
        MM: "%d months ago",
        y: "1 year ago",
        yy: "%d years ago"
    };
    
    Timeline = Ospriet.timeline();
    TopTweets = Ospriet.toptweets();
    CurrentQuestion = Ospriet.currentquestion();
    
    Timeline.init();
    TopTweets.init();
    CurrentQuestion.init();
    
    $('ul.participants li').tooltip({delay: 0});
    
    // change interval time to be much shorter if on display page
    refresh_interval = ($('.display-content').length > 0) ? 5 : 30
    
        // update timestamps every 5s
    var timestamps = setInterval(Timeline.updateTimestamps, 5000)
        // update content manually every 30s just in case websockets fail
      , refresh = setInterval(Ospriet.updateAll, (refresh_interval * 1000))
    
    // update content if tab had fallen out of focus
    $(document).bind("webkitvisibilitychange", function(){
      if(!document.webkitHidden) Ospriet.updateAll();
    });
  }
  
  exports.updateAll = function () {
    
    // reload the content if it's been longer than 30s since the last manual refresh
    
    var now = new Date()
      , refresh = updated.getTime() + (refresh_interval * 1000)
          
    if (refresh < now.getTime()) {
      Timeline.query();
      TopTweets.query();
      CurrentQuestion.query();
      updated = now;
    }
  }
  
  exports.extend = function (obj) {
    var args = Array.prototype.slice.call(arguments, 1)
      , l = args.length
      , i = 0
      , prop
      , source

    for (; i < l; i++) {
      source = args[i]
      for (prop in source) {
        if (source[prop] !== void 0) {
          obj[prop] = source[prop]
        }
      }
    }

    return obj
  }
  
  !function (exports) {
      exports.base = {
        init: function () {
          this.query();
        }
      , query: function () {
          $.ajax({
            url: 'api/'+this.data_url
          , dataType: 'json'
          , success: $.proxy(function (data) {
              this.update(data);
            }, this)
          })
        }

      , renderTweetHTML: function (txt) {
          return twttr.txt.autoLink(txt)
        }
      
      , setTweetData: function (tweet) {
          if(this.trim_question) tweet.status.text = tweet.status.text.slice(4)

          return {
              tweet_id: tweet.status_id
            , tweet_html: this.renderTweetHTML(tweet.status.text)
            , tweet_user: tweet.status.user.screen_name
            , tweet_time: tweet.status.created_at
            , tweet_time_clean: moment(tweet.status.created_at).format('hh:mma dddd MMM D YYYY')
            , tweet_time_rel: moment(tweet.status.created_at).fromNow(true)
          }
        }
      }
  }(mixins);
  
  !function (exports) {
    
    var Timeline = function () {
      this.initialized = false
      this.trim_question = true
      this.data_url = 'feed'
      this.dom_container = '.tweets-feed'
      this.templates = {
          empty: Hogan.compile('<p class="empty">No questions have been {{action}} yet.</p>')
        , tweet: Hogan.compile('<li><div class="tweet-content tweet-block"> <p>{{{tweet_html}}}</p></div><div class="tweet-metadata tweet-block"><div class="tweet-actions pull-right"> <ul class="actions"><li class="action-link"><a class="action-permalink" href="https://twitter.com/{{tweet_user}}/status/{{tweet_id}}" data-time-raw="{{tweet_time}}" title="{{tweet_time_clean}}" target="_blank">{{tweet_time_rel}}</a><span class="bullet">&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span></li> <li class="action-link"><a class="action-favorite" href="https://twitter.com/intent/favorite?tweet_id={{tweet_id}}">&#9733;&nbsp;Favorite</a></li> </ul> </div></div></li>')
      }
      
      Ospriet.socket
        .on('tweet', $.proxy(function(data){
          this.insert(data)
        }, this))
        
        .on('deletion', $.proxy(function(data){
          this.query()
        }, this));
      
    }
    
    Timeline.prototype = Ospriet.extend({}, mixins.base);
    
    Timeline.prototype.update = function (tweets) {
    
      var html = []
        , tweet_data
        , tweets_container = $(this.dom_container+' .tweets');
        
      tweets = this.sortTweets(tweets);
      
      if(tweets.length > 0){
        
        _.each(tweets, $.proxy(function(tweet) {
          tweet_data = this.setTweetData(tweet)
          html.push(this.templates.tweet.render(tweet_data))
        }, this))
        
        if(this.initialized) {
          $(this.dom_container+' p.empty').remove()
        }
        
        tweets_container
          .html(html.join(''))
        
      } else {
        if(!this.initialized){
          tweets_container.empty();
          $(this.dom_container+' .header').after(
            this.templates.empty.render({
              action: 'submitted'
            })
          );
          this.initialized = true;
        }
      }
    }
    
    Timeline.prototype.updateTimestamps = function () {
      var $timestamps = $('.action-link .action-permalink')
      $timestamps.each(function () {
        time = $(this).attr('data-time-raw');
        $(this).text(moment(time).fromNow(true));
      })
    }
    
    Timeline.prototype.setTweetData = function (tweet) {
      
      if(this.trim_question) tweet.text = tweet.text.slice(4)
      
      return {
          tweet_id:   tweet.id_str
        , tweet_html: this.renderTweetHTML(tweet.text)
        , tweet_user: tweet.user.screen_name
        , tweet_time: tweet.created_at
        , tweet_time_clean: moment(tweet.created_at).format('hh:mma dddd MMM D YYYY')
        , tweet_time_rel: moment(tweet.created_at).fromNow(true)
      }
    }
    
    Timeline.prototype.sortTweets = function (tweets){
      return _.sortBy(tweets, function (tweet) {
        return -(new Date(tweet.created_at));
      })
    }
    
    Timeline.prototype.insert = function (tweet) {
      if(this.initialized) {
        $(this.dom_container+' p.empty').remove()
      }
      
      tweet_data = this.setTweetData(tweet)
      
      var $tweet = $(this.templates.tweet.render(tweet_data));
          $tweet.prependTo(this.dom_container+' .tweets')
          
      var $li = $(this.dom_container+' .tweets li:first-child')
      
      var tweet_height = $li.height() + 36
      
      $li.css('margin-top', -tweet_height)
      $li.height()
      $li.addClass('offset')
      $li.height()
      $li.css('margin-top', '0')
    }
    
    exports.timeline = function () {
      return new Timeline();
    }
    
  }(Ospriet)
  
  !function (exports) {
    var CurrentQuestion = function () {
      this.trim_question = false
      this.animate_insert = false
      this.data_url = 'question'
      this.dom_container = '.tweets-current'
      this.templates = {
          empty:    Hogan.compile('<p class="empty">No questions have been {{action}} yet.</p>')
        , tweet:    Hogan.compile('<li><div class="tweet-stats tweet-block"> <span><strong>{{favorite_count}}</strong></span> </div><div class="tweet-content tweet-block"> <p>{{{tweet_html}}}</p></div><div class="tweet-metadata tweet-block"><div class="tweet-favorites pull-left span3"> <ul class="users">{{{tweet_favorites}}}</ul></div><div class="tweet-actions pull-right"> <ul class="actions"> <li class="action-link"><a class="action-permalink" href="https://twitter.com/{{tweet_user}}/status/{{tweet_id}}" data-time-raw="{{tweet_time}}" title="{{tweet_time_clean}}" target="_blank">{{tweet_time_rel}}</a><span class="bullet">&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span></li><li class="action-link"><a class="action-favorite" href="https://twitter.com/intent/favorite?tweet_id={{tweet_id}}">&#9733;&nbsp;Favorite</a></li></ul> </div></div></li>')
        , favorite: Hogan.compile('<li rel="tooltip" data-placement="bottom" data-original-title="{{name}}"><a href="https://twitter.com/intent/user?screen_name={{screen_name}}"><img src="{{img_url}}" /></a></li>')
      }
      
      Ospriet.socket
        .on('selected', $.proxy(function(data){
            this.animate_insert = true;
            this.query()
          }, this))
        .on('deselected', $.proxy(function(data){
            this.animate_insert = true;
            this.query()
          }, this))
        ;
    }
    
    CurrentQuestion.prototype = Ospriet.extend({}, mixins.base);
    
    CurrentQuestion.prototype.update = function (tweets) {
    
      if(tweets.length > 0){
        // filter moderator-marked tweets to last marked tweet
        var tweet = _.last(tweets);
              
        var html = [],
            users = [],
            tweet_data = this.setTweetData(tweet)
        
        _.each(tweet.users, $.proxy(function(user) {
          users.push(this.templates.favorite.render({
              name: user.full_name
            , screen_name: user.screen_name
            , img_url: user.profile_icon
          }))
        }, this))
    
        tweet_data.favorite_count = tweet.users.length
        tweet_data.tweet_favorites = users.join('')
        
        var $tweet = $(this.templates.tweet.render(tweet_data));
        $(this.dom_container+' .tweets')
          .html($tweet)
          .find('ul.users li').tooltip({delay: 0});
        
        this.show();
      } else {
        this.hide()
      }
    }
    
    CurrentQuestion.prototype.hide = function () {
      
      var $bottom_container = $('.display-content .additional-content')

      $(this.dom_container).slideUp(300);
      $bottom_container.animate({"margin-top": "0px"}, 300)
    }
    
    CurrentQuestion.prototype.show = function () {

      var $bottom_container = $('.display-content .additional-content')
        , visible
        , base_height = Number($(this.dom_container).height())
      
      // janky hack to get height of element inside the dom before animating
      // if the element is not already in the dom
      if($(this.dom_container).css('display') === 'none') {
        $(this.dom_container).show();
        base_height = Number($(this.dom_container).height())
        $(this.dom_container).hide();
      }
      
      height = base_height
          + Number($(this.dom_container).css('marginTop').slice(0,-2))
          + Number($(this.dom_container).css('marginBottom').slice(0,-2))
          + Number($(this.dom_container).css('paddingTop').slice(0,-2))
          + Number($(this.dom_container).css('paddingBottom').slice(0,-2));
          
      if(this.animate_insert === true){
        $(this.dom_container).slideDown(300)
        $bottom_container.animate({"margin-top": height+"px"}, 300)
      } else {
        $(this.dom_container).show()
        $bottom_container.css({"margin-top": height+"px"})
      }
    }
    
    exports.currentquestion = function () {
      return new CurrentQuestion();
    }
    
  }(Ospriet)
  
  !function (exports) {
    
    var TopTweets = function () {
      this.initialized = false
      this.trim_question = true
      this.data_url = 'top'
      this.dom_container = '.tweets-top'
      this.templates = {
          empty:    Hogan.compile('<p class="empty">No questions have been {{action}} yet.</p>')
        , tweet:    Hogan.compile('<li><div class="tweet-stats tweet-block"> <span><strong>{{favorite_count}}</strong></span> </div><div class="tweet-content tweet-block"> <p>{{{tweet_html}}}</p></div><div class="tweet-metadata tweet-block"><div class="tweet-favorites pull-left span3"> <ul class="users">{{{tweet_favorites}}}</ul></div><div class="tweet-actions pull-right"> <ul class="actions"> <li class="action-link"><a class="action-permalink" href="https://twitter.com/{{tweet_user}}/status/{{tweet_id}}" data-time-raw="{{tweet_time}}" title="{{tweet_time_clean}}" target="_blank">{{tweet_time_rel}}</a><span class="bullet">&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span></li><li class="action-link"><a class="action-favorite" href="https://twitter.com/intent/favorite?tweet_id={{tweet_id}}">&#9733;&nbsp;Favorite</a></li></ul> </div></div></li>')
        , favorite: Hogan.compile('<li rel="tooltip" data-placement="bottom" data-original-title="{{name}}"><a href="https://twitter.com/intent/user?screen_name={{screen_name}}"><img src="{{img_url}}" /></a></li>')
      }
    
      Ospriet.socket
        .on('favorite', $.proxy(function(data){
          // console.log('favorite', data);
          this.query()
        }, this));
      
    }
    
    TopTweets.prototype = Ospriet.extend({}, mixins.base);
    
    TopTweets.prototype.update = function (tweets) {
    
      var html = []
        , tweet_data
        , tweets_container = $(this.dom_container+' .tweets');
        
      // filter tweets for only those with favorites
      var tweets = _.filter(tweets, function (tweet) {
        return tweet.users.length;
      });
                    
      if(tweets.length > 0) {
                
        tweets = this.sortTweets(tweets);
        
        _.each(tweets, $.proxy(function(tweet) {
          
          //hack conditional until tweets are removed from mongo when no users have it as a favorite
          if(tweet.users.length > 0){
            tweet_data = this.setTweetData(tweet)
            var users = [];
        
            _.each(tweet.users, $.proxy(function(user) {
              users.push(this.templates.favorite.render({
                  name: user.full_name
                , screen_name: user.screen_name
                , img_url: user.profile_icon
              }))
            }, this))
        
            tweet_data.favorite_count = tweet.users.length
            tweet_data.tweet_favorites = users.join('')
       
            html.push(this.templates.tweet.render(tweet_data))
          }
        }, this))
        
        
        if(this.initialized) {
          $(this.dom_container+' p.empty').remove()
        }
        
        $(tweets_container)
          .html(html.join(''))
          .find('ul.users li').tooltip({delay: 0});

      } else {
              
        if(!this.initialized){
          tweets_container.empty();
          $(this.dom_container).append(
            this.templates.empty.render({
              action: 'voted on'
            })
          );
          this.initialized = true;
        }
      }
    }

    TopTweets.prototype.sortTweets = function (tweets){
      return _.sortBy(tweets, function (tweet) {
        return (-1 * tweet.users.length);
      })
    }
    
    exports.toptweets = function () {
      return new TopTweets();
    }
    
  }(Ospriet)
  
}(Ospriet);

$(document).ready(function() {
  Ospriet.init();
});