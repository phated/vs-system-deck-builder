const createFeed = require('fair-analytics/lib/feed')
const createServer = require('fair-analytics/lib/server')
const createSubscriptions = require('fair-analytics/lib/wire-subscriptions')
const sse = require('fair-analytics/lib/sse')
const createStatsDb = require('fair-analytics/lib/stats-db')

const statsDb = createStatsDb('./storage', true);
const broadcast = createSubscriptions(sse, statsDb);
const feed = createFeed('./storage', true);
const server = createServer(feed, broadcast, sse, statsDb, '*');

server.listen(process.env.PORT || 3000);