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

module.exports = require('./ApplicationController').extend(function () {
  this.StreamService = this.getService('Stream')
})
  .methods({

    /**
     * Main page for the site. Renders a list of
     * all tweets, favorites, participants and questions.
     */
     index: function () {
        this.render('index', {
            view:            'index'
          , event:           this.config.event
          , participants:    this.config.participants
          , screen_name:     this.config.twitter_account.screen_name
          , site:            this.config.site
          , css: [
              {url: 'lib/bootstrap/bootstrap-responsive.css'}
            , {url: 'css/application-responsive.css'}
            ]
        });
      }

      /**
       * The screen specifically designed for high-contrast
       * reading. Used for participants / hosts to be able to
       * quickly grok the current question etc.
       */
    , display: function () {
        this.render('display', {
          view:             'presentation'
        , event:            this.config.event
        , screen_name:      this.config.twitter_account.screen_name
        , site:             this.config.site
        });
      }

  });