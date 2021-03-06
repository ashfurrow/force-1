import { buildServerApp } from 'reaction/Artsy/Router'
import { Meta, query, toJSONLD } from './components/Meta'
import { renderLayout } from '@artsy/stitch'
import { routes } from 'reaction/Apps/Artist/routes'
import express from 'express'
import metaphysics from 'lib/metaphysics.coffee'
import React from 'react'
import styled from 'styled-components'

const app = (module.exports = express())

app.get('/artist/:artistID*', async (req, res, next) => {
  try {
    const user = req.user && req.user.toJSON()

    const { ServerApp, redirect, status } = await buildServerApp({
      routes,
      url: req.url,
      context: {
        initialMatchingMediaQueries: res.locals.sd.IS_MOBILE
          ? ['xs']
          : undefined,
        user,
      },
    })

    if (redirect) {
      res.redirect(302, redirect.url)
      return
    }

    // FIXME: Move this to Reaction
    const Container = styled.div`
      width: 100%;
      max-width: 1192px;
      margin: auto;
    `

    const send = {
      method: 'post',
      query,
      variables: { artistID: req.params.artistID },
    }

    const { artist } = await metaphysics(send).then(data => data)
    const { APP_URL, IS_MOBILE, REFERRER } = res.locals.sd
    const isExternalReferer = !(REFERRER && REFERRER.includes(APP_URL))
    const jsonLD = toJSONLD(artist, APP_URL)

    res.locals.sd.ARTIST_PAGE_CTA_ENABLED =
      !user && isExternalReferer && !IS_MOBILE
    res.locals.sd.ARTIST_PAGE_CTA_ARTIST_ID = req.params.artistID

    // While we are rolling out the new page, override the default (`artist`)
    // type inferred from the URL, for tracking and comparison purposes.
    res.locals.sd.PAGE_TYPE = 'new-artist'

    // Render layout
    const layout = await renderLayout({
      basePath: __dirname,
      layout: '../../components/main_layout/templates/react_redesign.jade',
      config: {
        styledComponents: true,
      },
      blocks: {
        head: () => <Meta sd={res.locals.sd} artist={artist} />,
        body: () => (
          <Container>
            <ServerApp />
          </Container>
        ),
      },
      locals: {
        ...res.locals,
        assetPackage: 'artist2',
      },
      data: {
        jsonLD,
      },
    })

    res.status(status).send(layout)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default app
