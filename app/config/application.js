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

module.exports = {

  /*
  TODO: Change all of the values here with your app's own credentials
        Refer to https://github.com/twitter/ospriet/wiki/Customizing-Ospriet for help
  */

  /* Application configuration */
  twitter_app: {
      consumer_key:         ''
    , consumer_secret:      ''
    , access_token_key:     ''
    , access_token_secret:  ''
  }

  , twitter_account: {
      id:           '495336570'
    , screen_name:  'dftg'
  }

  , moderators: [
    {
      id_str: '18644328'
    , screen_name: 'philcoffman'
    }
  ]

  , blacklist: [
    {
      id_str: ''
    , screen_name: ''
    }
  ]

  /* Site/UI configuration */
  , site: {
      raw_url:          'http://designfromthegut.com'
    , display_url:      'designfromthegut.com'
    , google_analytics: 'UA-8533626-2'
  }

  , event: {
      title:        'Design from the Gut'
    , description:  'Debating whether research or intuition is a better approach to design should be a communal discussion.'
    , instructions: '<strong>Submit a question or comment by posting a tweet to <a href="https://twitter.com/intent/user?screen_name=dftg" title="Design from the Gut on Twitter">@dftg</a> via the button below. Review the submissions and favorite the ones you\'d like to see answered</strong>. The moderator will choose from the top picks.'
    , time:         'Friday, 3/9, 3:30p'
    , location:     'Ballroom BC &bull; ACC'
    , details_url:  'http://schedule.sxsw.com/2012/events/event_IAP11592'
  }

  , participants: [
    {
        name:     'Phil Coffman'
      , title:    'Principal, Element'
      , twitter:  'philcoffman'
      , img_url:  'coffman.gif'
      , role:     'Moderator'
    }
    , {
        name:     'Bill Couch'
      , title:    'Software engineer, Twitter'
      , twitter:  'couch'
      , img_url:  'couch.gif'
      , role:     'Panelist'
    }
    , {
        name:     'Naz Hamid'
      , title:    'Principal, Weightshift'
      , twitter:  'weightshift'
      , img_url:  'hamid.gif'
      , role:     'Panelist'
    }
    , {
        name:     'Laurel Hechanova'
      , title:    'Designer, Illustrator, Apocalypse OK'
      , twitter:  'hechanova'
      , img_url:  'hechanova.gif'
      , role:     'Panelist'
    }
    , {
        name:     'Jane Leibrock'
      , title:    'User Experience Researcher, Facebook'
      , twitter:  'fencebreak'
      , img_url:  'leibrock.gif'
      , role:     'Panelist'
    }
  ]
}