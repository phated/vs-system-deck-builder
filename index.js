'use strict';

var inu = require('inu');
var start = inu.start;
var pull = inu.pull;
var yo = require('yo-yo');

var Immutable = require('seamless-immutable');

var Notify = require('pull-notify');

var pl = require('pull-level');
var levelup = require('levelup');
var leveljs = require('level-js');

var db = levelup('vs-db', { db: leveljs, valueEncoding: 'json' });

var map = require('collection-map');
var reduce = require('object.reduce');

var navbarMount = require('./navbar.app');

var navbarEl = document.querySelector('.navbar');
var paneContainerEl = document.querySelector('.pane-container');

var data = require('./vs-cards');
console.log(data);

var attach = require('./tabs');

var classes = require('./classes');

function init() {
  return {
    model: Immutable({
      mc: {},
      location: {},
      sc: {},
      pt: {},
      equipment: {},
      token: {},
      cards: Immutable.asObject(data, function(card) {
        return [card.guid, card];
      })
    }),
    effect: 'INIT_APP'
  };
}

function increment(count) {
  count = count || 0;
  return count + 1;
}

function update(model, action) {
  var updated;

  switch(action.type) {
    // Load data
    case 'LOAD_DECK': {
      updated = Immutable.merge(model, action.payload, { deep: true });
      return { model: updated };
    }
    // MC
    case 'ADD_MC': {
      updated = Immutable.updateIn(model, ['mc', action.payload], increment);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    case 'RESET_MC': {
      updated = Immutable.setIn(model, ['mc', action.payload], undefined);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    // Location
    case 'ADD_LOCATION': {
      updated = Immutable.updateIn(model, ['location', action.payload], increment);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    case 'RESET_LOCATION': {
      updated = Immutable.setIn(model, ['location', action.payload], undefined);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    // SC
    case 'ADD_SC': {
      updated = Immutable.updateIn(model, ['sc', action.payload], increment);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    case 'RESET_SC': {
      updated = Immutable.setIn(model, ['sc', action.payload], undefined);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    // PT
    case 'ADD_PT': {
      updated = Immutable.updateIn(model, ['pt', action.payload], increment);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    case 'RESET_PT': {
      updated = Immutable.setIn(model, ['pt', action.payload], undefined);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    // Equipment
    case 'ADD_EQUIPMENT': {
      updated = Immutable.updateIn(model, ['equipment', action.payload], increment);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    case 'RESET_EQUIPMENT': {
      updated = Immutable.setIn(model, ['equipment', action.payload], undefined);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    // Token
    case 'ADD_TOKEN': {
      updated = Immutable.updateIn(model, ['token', action.payload], increment);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    case 'RESET_TOKEN': {
      updated = Immutable.setIn(model, ['token', action.payload], undefined);
      return { model: updated, effect: 'SAVE_DECK' };
    }
    // UI stuff
    case 'EXPAND_CARD': {
      updated = Immutable.setIn(model, ['cards', action.payload, 'expanded'], true);
      return { model: updated };
    }
    case 'COLLAPSE_CARD': {
      updated = Immutable.setIn(model, ['cards', action.payload, 'expanded'], false);
      return { model: updated };
    }
    default: {
      return { model: model };
    }
  }
}

function cardListPane(model, dispatch) {
  var cards = map(model.cards, function(card) {
    return cardView(card, model, dispatch);
  });

  return yo`<div id="card-list-pane" class="pane">
    ${cards}
  </div>`;
}

function statsView(card) {
  return yo`
    <div className="${classes.cardDetailLine}">
      <span>${card.atk}</span>
      <span><img src="images/icons/cards/attack.png"></span>
      <span>${card.def}</span>
      <span><img src="images/icons/cards/defense.png"></span>
      <span>${card.health}</span>
      <span><img src="images/icons/cards/health.png"></span>
    </div>
  `;
}

function typeView(card) {
  var text = card.type;
  if (card.traits) {
    text += ` - ${card.traits}`;
  }

  return yo`
    <div className="${classes.cardDetailLine}">${text}</div>
  `;
}

function abilityView(card) {
  var out = yo`
    <div className="${classes.cardDetailLine} ${classes.cardAbility}"></div>
  `;

  out.innerHTML = card.text;

  return out;
}

function costView(card) {
  if (!card.cost) {
    return;
  }

  return yo`
    <div className="${classes.cardDetailLine}">Cost: ${card.cost}</div>
  `;
}

function moreDetailsView(card) {
  if (!card.expanded) {
    return;
  }

  return yo`
    <div className="${classes.moreDetails}">
      ${costView(card)}
      ${typeView(card)}
      ${statsView(card)}
      ${abilityView(card)}
    </div>
  `;
}

function cardView(card, model, dispatch) {
  var limit = card.limit;
  var used = 0;

  var type = '';
  switch(card.type) {
    case 'Main Character L1':
    case 'Main Character L2':
    case 'Main Character L3':
      type = 'MC';
      used = Immutable.getIn(model, ['mc', card.guid], 0);
      break;
    case 'Supporting character':
      type = 'SC';
      used = Immutable.getIn(model, ['sc', card.guid], 0);
      break;
    case 'Plot twist':
      type = 'PT';
      used = Immutable.getIn(model, ['pt', card.guid], 0);
      break;
    case 'Location':
    case 'Special Location':
      type = 'LOCATION';
      used = Immutable.getIn(model, ['location', card.guid], 0);
      break;
    case 'Equipment':
      type = 'EQUIPMENT';
      used = Immutable.getIn(model, ['equipment', card.guid], 0);
      break;
    case '':
    case 'Facehugger Pile':
      type = 'TOKEN';
      used = Immutable.getIn(model, ['token', card.guid], 0);
      break;
    default:
      // debugger;
  }
  var addToDeck;
  if (used < card.limit) {
    addToDeck = dispatch.bind(null, { type: `ADD_${type}`, payload: card.guid });
  } else {
    addToDeck = dispatch.bind(null, { type: `RESET_${type}`, payload: card.guid });
  }
  var toggleDetails;
  if (card.expanded) {
    toggleDetails = dispatch.bind(null, { type: 'COLLAPSE_CARD', payload: card.guid });
  } else {
    toggleDetails = dispatch.bind(null, { type: 'EXPAND_CARD', payload: card.guid });
  }

  var changeButton = yo`
    <button className="${classes.addToDeckButton}" onclick=${addToDeck}>
      <span className="${classes.visuallyhidden}">Add To Deck</span>
    </button>
  `;

  return yo`
    <div id=${card.guid} className=${classes.listItem}>
      <img className="${classes.cardThumbnail}" src="${'images/cards/small/' + card.image.toLowerCase() + '.jpg'}" />
      <div className="${classes.cardDetails}" onclick=${toggleDetails}>
        <div className="${classes.cardTitle}">${card.name}</div>
        ${moreDetailsView(card)}
        <div className="${classes.cardCounts}">
          <div>Limit: ${limit}</div>
          <div>Used: ${used}</div>
          <div>Free: ${limit - used}</div>
        </div>
      </div>
      ${changeButton}
    </div>
  `;
}

function count(obj) {
  return reduce(obj, function(res, val) {
    val = val || 0;
    res += val;
    return res;
  }, 0);
}

function header(title, amount) {
  return yo`<div id=${title} className="${classes.listItemHeader}">${title} (${amount})</div>`
}

function mcView(model, dispatch) {
  var amount = count(model.mc);
  if (!amount) {
    return;
  }

  var cards = map(model.mc, function(amt, guid) {
    if (!amt) {
      return;
    }

    var card = Immutable.getIn(model, ['cards', guid]);

    var out = cardView(card, model, dispatch);

    out.id = `deck-list-${out.id}`;

    return out;
  });

  return [
    header('Main Character', amount),
    cards
  ];
}

function locationView(model, dispatch) {
  var amount = count(model.location);
  if (!amount) {
    return;
  }

  var cards = map(model.location, function(amt, guid) {
    if (!amt) {
      return;
    }

    var card = Immutable.getIn(model, ['cards', guid]);

    var out = cardView(card, model, dispatch);

    out.id = `deck-list-${out.id}`;

    return out;
  });

  return [
    header('Locations', amount),
    cards
  ];
}

function equipmentView(model, dispatch) {
  var amount = count(model.equipment);
  if (!amount) {
    return;
  }

  var cards = map(model.equipment, function(amt, guid) {
    if (!amt) {
      return;
    }

    var card = Immutable.getIn(model, ['cards', guid]);

    var out = cardView(card, model, dispatch);

    out.id = `deck-list-${out.id}`;

    return out;
  });

  return [
    header('Equipment', amount),
    cards
  ];
}

function ptView(model, dispatch) {
  var amount = count(model.pt);
  if (!amount) {
    return;
  }

  var cards = map(model.pt, function(amt, guid) {
    if (!amt) {
      return;
    }

    var card = Immutable.getIn(model, ['cards', guid]);

    var out = cardView(card, model, dispatch);

    out.id = `deck-list-${out.id}`;

    return out;
  });

  return [
    header('Plot Twists', amount),
    cards
  ];
}

function scView(model, dispatch) {
  var amount = count(model.sc);
  if (!amount) {
    return;
  }

  var cards = map(model.sc, function(amt, guid) {
    if (!amt) {
      return;
    }

    var card = Immutable.getIn(model, ['cards', guid]);

    var out = cardView(card, model, dispatch);

    out.id = `deck-list-${out.id}`;

    return out;
  });

  return [
    header('Supporting Characters', amount),
    cards
  ];
}

function tokenView(model, dispatch) {
  var amount = count(model.token);
  if (!amount) {
    return;
  }

  var cards = map(model.token, function(amt, guid) {
    if (!amt) {
      return;
    }

    var card = Immutable.getIn(model, ['cards', guid]);

    var out = cardView(card, model, dispatch);

    out.id = `deck-list-${out.id}`;

    return out;
  });

  return [
    header('Tokens', amount),
    cards
  ];
}

function deckListPane(model, dispatch) {
  return yo`<div id="deck-list-pane" className="pane">
    ${mcView(model, dispatch)}
    ${locationView(model, dispatch)}
    ${equipmentView(model, dispatch)}
    ${ptView(model, dispatch)}
    ${scView(model, dispatch)}
    ${tokenView(model, dispatch)}
  </div>`;
}

function view(model, dispatch) {
  return yo`
    <div class="pane-container">
      ${cardListPane(model, dispatch)}
      ${deckListPane(model, dispatch)}
    </div>
  `;
}


function run(effect, sources) {
  switch(effect) {
    case 'INIT_APP': {
      return pull(
        pl.read(db),
        pull.map(function (row) {
          return {
            type: 'LOAD_DECK',
            payload: row.value
          }
        })
      );
    }
    case 'SAVE_DECK': {
      console.log(sources);
      return pull(
        sources.models(),
        pull.map(function(model) {
          return {
            key: 0,
            value: Immutable.without(model, 'cards')
          };
        }),
        // Broken impl needs windowSize
        pl.write(db, { windowSize: 0 })
      )
    }
  }
}

var app = {
  init: init,
  update: update,
  view: view,
  run: run
};

var sources = start(app);

var firstRender = true;
var renderRequested = false;

function render(view) {
  if (renderRequested) {
    return;
  }

  console.log('render');

  renderRequested = true;
  requestAnimationFrame(function() {
    yo.update(paneContainerEl, view, { childrenOnly: true });
    renderRequested = false;

    if (firstRender) {
      console.log('attach tabs');
      var notify = Notify();
      var tabEE = attach(paneContainerEl);
      tabEE.on('tab-shown', notify);
      navbarMount(navbarEl, notify.listen);
      firstRender = false;
    }
  });
}

pull(
  sources.views(),
  pull.drain(render)
);

pull(
  sources.models(),
  pull.drain(function(model) {
    console.log(model);
  })
);