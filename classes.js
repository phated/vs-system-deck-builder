'use strict';

var cxs = require('cxs').default;

var lightgray = '#d3d3d3';

var listItem = cxs({
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  minHeight: '70px',
  borderBottom: `1px solid ${lightgray}`
});

var cardThumbnail = cxs({
  borderRadius: '3px',
  maxWidth: '100%',
  maxHeight: '53px'
});

var cardDetails = cxs({
  padding: '0 10px',
  flexGrow: '1',
  display: 'flex',
  flexDirection: 'column',
  transition: 'max-height 2s'
});
var moreDetails = cxs({
  paddingBottom: '5px'
});

var cardDetailLine = cxs({
  marginBottom: '5px',
  // whiteSpace: 'pre-wrap'
});

var cardTitle = cxs({
  flexGrow: 1,
  fontWeight: 700,
  marginBottom: '5px'
});

var cardCounts = cxs({
  display: 'flex',
  justifyContent: 'space-between'
});

var addToDeckButton = cxs({
  backgroundColor: 'transparent',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '50% 50%',
  backgroundPosition: 'center',
  border: 0,
  borderLeft: `1px solid ${lightgray}`,
  width: '50px',
  outline: 'none',
  flexShrink: 0,
  backgroundImage: 'url(https://rawgit.com/driftyco/ionicons/master/src/plus-round.svg)'
});

/* From h5bp */
var visuallyhidden = cxs({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px'
});

module.exports = {
  addToDeckButton: addToDeckButton,
  visuallyhidden: visuallyhidden,
  listItem: listItem,
  cardThumbnail: cardThumbnail,
  cardDetails: cardDetails,
  moreDetails: moreDetails,
  cardDetailLine: cardDetailLine,
  cardTitle: cardTitle,
  cardCounts: cardCounts
};