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
module.exports = require(app.set('models') + '/ApplicationModel').extend(function () {
  this.UserSchema = new this.Schema({
    id_str          : { type: String, required: true }
  , profile_icon    : { type: String, required: true }
  , screen_name     : { type: String, required: true }
  , full_name       : { type: String, required: true }
  })

  this.FavoritesSchema = new this.Schema({
    status_id : String
  , status    : this.Schema.Types.Mixed
  , users     : [this.UserSchema]
  , marked    : Boolean
  })

  this.DBModel = this.mongoose.model('Favorite', this.FavoritesSchema)
})
    .methods({


      /**
       * Gets a favorite by twitter status id
       * @param {string} id
       * @param {function} callback A favorite object if found, or null
       */
      getFavorite: function (id, callback) {
        this.DBModel
          .findOne()
          .where('status_id', id)
          .run(callback)
      }


      /**
       * Gets a list of all favorites
       * @param {function} callback An array containing favorites
       */
    , getFavorites: function (callback) {
        this.DBModel
          .find({})
          .run(callback)
      }


      /**
       * Gets a list favorites which have been marked by a moderator to be answered
       * @param {function} callback An array containing favorites
       */
    , getQuestions: function (callback) {
        this.DBModel
          .find()
          .where('marked', true)
          .run(callback)
      }


      /**
       * Creates a new 'tweet' in the system
       * @param {object} user Creators twitter object
       * @param {object} status The twitter status object
       * @param {boolen} marked If a moderator has marked it to be answered
       * @param {function} callback The object which was created
       */
    , create: function (user, status, marked, callback) {
        var favorite = new this.DBModel()
        favorite.status_id = status.id_str
        favorite.status = status
        favorite.marked = marked
        favorite.users.push({
          id_str        : user.id_str
        , profile_icon  : user.profile_image_url
        , screen_name   : user.screen_name
        , full_name     : user.name
        })
        favorite.save(callback)
      }


      /**
       * Adds a new favorite to a 'tweet'. This is
       * used when people favorite the items in our system
       * to increment the amount of users who've liked the item
       * @param {object} user The user who has liked the tweet
       * @param {object} favorite The item which they are liking
       * @param {boolen} marked If a moderator has marked it to be answered
       * @param {function} callback The object which was created
       */
    , add: function (user, favorite, marked, callback) {
        favorite.marked = marked
        favorite.users.push({
          id_str        : user.id_str
        , profile_icon  : user.profile_image_url
        , screen_name   : user.screen_name
        , full_name     : user.name
        })
        favorite.save(callback)
      }


      /**
       * Removes a favorite from an item. Called if a user
       * has liked an item, and decides to unlink it.
       * @param {object} user The user who has unliked the tweet
       * @param {object} favorite The item which they are unliking
       * @param {boolen} marked If a moderator has marked it to be answered
       * @param {function} callback The object which was removed
       */
    , remove: function (user, favorite, marked, callback) {
        // TODO: remove status if there are no favorites
        this.DBModel.update(
          { "status_id" : favorite.status_id }
        , { $set : { "marked" : marked }
        , $pull : { "users" : { 'id_str': user.id_str } } }
        , callback)
      }

  });