_ = require 'underscore'
Articles = require '../../../collections/articles.coffee'
ArticlesFeedView = require '../../../components/articles_feed/view.coffee'
sd = require('sharify').data

module.exports.init = ->
  articles = new Articles sd.ARTICLES
  articles.count = sd.ARTICLES_COUNT + 4
  articles.reset articles.feed()

  view = new ArticlesFeedView
    el: $('.articles-articles-feed')
    collection: articles
    fetchWith:
      limit: 50
      published: true
      featured: true
      sort: '-published_at'

  view.render()