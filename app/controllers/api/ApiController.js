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

module.exports = require('../ApplicationController').extend(function () {
  this.StreamService = this.getService('Stream')
})
  .methods({


    /**
     * @return Returns JSON list of all tweets
     */
    feed: function () {
      this.StreamService.getFeed(function (feed) {
        this.response.json(feed)
      }.bind(this))
    }


    /**
     * @return Returns JSON list of all favorites
     */
  , top: function () {
      this.StreamService.getFavorites(function (favorites) {
        favorites = (favorites.length > 0) ? favorites : [] // Todo: this should be handled at the service level
        this.response.json(favorites)
      }.bind(this))
    }


    /**
     * @return Returns JSON list of all tweets which have been marked
     */
  , question: function () {
      this.StreamService.getQuestions(function(questions) {
        this.response.json(questions)
      }.bind(this))
    }


    /**
     * Forces a refresh on the service
     * @return Returns JSON indicating if the refresh was successful
     */
  , refresh: function () {
      this.StreamService.refreshFeed(function(resp) {
        this.response.json(resp)
      }.bind(this))
    }

  })