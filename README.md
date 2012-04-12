## Ospriet — An example audience moderation app built on Twitter

[Ospriet](http://twitter.github.com/ospriet) is a moderation tool that allows for audiences to post and vote on questions/comments for talks, presentations, and events. The application is written in [node.js](http://nodejs.org/), uses [MongoDB](http://www.mongodb.org/) for database storage, and is designed for deployment on [nodejitsu](http://nodejitsu.com/).

## Motivations

Why open source it?

* Several people asked for the source after SXSW 2012 to implement the application for their own use
* The app serves as a good example of building upon the Twitter platform
* Everyone can now use it and help improve the code base

You can view an example of the site powered by the application used at a 2012 SXSW panel at [http://designfromthegut.com](http://designfromthegut.com).

For more information on the origins of the application, read [this post](http://couch.tumblr.com/post/18854314402).

## Overview

Ospriet allows anyone with a Twitter account to submit a question or comment, by posting an @-reply to a Twitter account dedicated for an audience-oriented event. The submission will be reposted to the event's account, with attribution. Audience members can vote up the best submissions by favoriting the submissions on the event account. Ospriet will then keep track of all of the favorites and provide the top submissions. Ospriet provides one single, simple interface for all of this that audience members can use on most devices.

As an example, let's take the event account of <a href="https://twitter.com/dftg">@dftg</a> and submit a question.

    @dftg: What are your thoughts on Apple’s approach to design?

This tweet will be reposted by the application to <a href="https://twitter.com/dftg">@dftg</a> as an @-reply to your submission, and look like this:

    From @couch: What are your thoughts on Apple's approach to design?

Anyone can then favorite that reposted tweet, and see the top favorited submissions on the site.

## Setup

Please refer to these wiki pages to download, customize, and deploy your own instance of Ospriet.

* [Creating your development environment](https://github.com/twitter/ospriet/wiki/Creating-your-development-environment)
* [Creating a Twitter app](https://github.com/twitter/ospriet/wiki/Creating-a-Twitter-app)
* [Customizing Ospriet](https://github.com/twitter/ospriet/wiki/Customizing-Ospriet)
* [Testing Opsriet](https://github.com/twitter/ospriet/wiki/Testing-Ospriet)
* [Working with nodejitsu](https://github.com/twitter/ospriet/wiki/Working-with-nodejitsu)

## Libraries

**Server-side**

- [Matador](http://obvious.github.com/matador) _for MVC app structure_
- [ntwitter](http://github.com/avianflu/ntwitter) _node.js wrapper for Twitter API_
- [mongoose](http://mongoosejs.com/) _node.js wrapper for MongoDB_
- [socket.io](http://socket.io) _for real-time updating of client-side UI_

**Client-side**

- [Bootstrap](http://twitter.github.com/bootstrap) _for skeletal layout and micro-jQuery plugins_
- [underscore.js](http://documentcloud.github.com/underscore) _for client-side data manipulation_
- [hogan.js](http://twitter.github.com/hogan.js) _for template rendering_
- [Twitter Web Intents](https://dev.twitter.com/docs/intents) _for tweet actions without authentication_

## Screenshots

**Main index view**
<br/>
<img src="http://twitter.github.com/ospriet/images/index.jpg" title="Ospriet primary view" alt="Ospriet primary view" width="500" />
<br/>

**Presentation view for projector/screens**
<br/>
<img src="http://twitter.github.com/ospriet/images/display.jpg" title="Ospriet presentation view" alt="Ospriet presentation view" width="500" />
<br/>

**Responsive layout for mobile**
<br/>
<img src="http://twitter.github.com/ospriet/images/iphone.jpg" title="Ospriet mobile view" alt="Ospriet mobile view" width="300" />
<br/>

## Issues and Contributions

Have a bug or contribution? Create an issue here on GitHub!

[https://github.com/twitter/ospriet/issues](https://github.com/twitter/ospriet/issues)

## Versioning

For transparency and insight, releases will be numbered with the follow format:

    <major>.<minor>.<patch>

And constructed with the following guidelines:

* Breaking backwards compatibility bumps the major
* New additions without breaking backwards compatibility bumps the minor
* Bug fixes and misc changes bump the patch

For more information on semantic versioning, please visit http://semver.org/.


## Authors

**Bill Couch**

+ [https://github.com/couch](https://github.com/couch)
+ [https://twitter.com/couch](https://twitter.com/couch)

**Dustin Senos**

+ [https://github.com/dustinsenos](https://github.com/dustinsenos)
+ [https://twitter.com/dustin](https://twitter.com/dustin)

## License

Copyright 2012 Twitter, Inc.

Licensed under the Apache License, Version 2.0: [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)