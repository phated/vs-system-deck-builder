'use strict';

var inu = require('inu');
var start = inu.start;
var pull = inu.pull;
var html = inu.html;

var Immutable = require('seamless-immutable');

var Notify = require('pull-notify');

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
      cards: data
    }),
    effect: 'ATTACH_TABS'
  };
}

function increment(count) {
  count = count || 0;
  return count + 1;
}

function find(arr, fn) {
  return arr.reduce(function(res, val) {
    if (res) {
      return res;
    }

    var check = fn(val);

    if (check) {
      res = check;
    }

    return res;
  });
}

function update(model, action) {
  var updated;

  switch(action.type) {
    // MC
    case 'ADD_MC': {
      updated = Immutable.updateIn(model, ['mc', action.payload], increment);
      return { model: updated };
    }
    case 'RESET_MC': {
      updated = Immutable.setIn(model, ['mc', action.payload], undefined);
      return { model: updated };
    }
    // Location
    case 'ADD_LOCATION': {
      updated = Immutable.updateIn(model, ['location', action.payload], increment);
      return { model: updated };
    }
    case 'RESET_LOCATION': {
      updated = Immutable.setIn(model, ['location', action.payload], undefined);
      return { model: updated };
    }
    // SC
    case 'ADD_SC': {
      updated = Immutable.updateIn(model, ['sc', action.payload], increment);
      return { model: updated };
    }
    case 'RESET_SC': {
      updated = Immutable.setIn(model, ['sc', action.payload], undefined);
      return { model: updated };
    }
    // PT
    case 'ADD_PT': {
      updated = Immutable.updateIn(model, ['pt', action.payload], increment);
      return { model: updated };
    }
    case 'RESET_PT': {
      updated = Immutable.setIn(model, ['pt', action.payload], undefined);
      return { model: updated };
    }
    // Equipment
    case 'ADD_EQUIPMENT': {
      updated = Immutable.updateIn(model, ['equipment', action.payload], increment);
      return { model: updated };
    }
    case 'RESET_EQUIPMENT': {
      updated = Immutable.setIn(model, ['equipment', action.payload], undefined);
      return { model: updated };
    }
    // Token
    case 'ADD_TOKEN': {
      updated = Immutable.updateIn(model, ['token', action.payload], increment);
      return { model: updated };
    }
    case 'RESET_TOKEN': {
      updated = Immutable.setIn(model, ['token', action.payload], undefined);
      return { model: updated };
    }
    // UI stuff
    case 'EXPAND_CARD': {
      updated = Immutable.update(model, 'cards', function(cards) {
        return cards.map(function(card) {
          if (card.guid === action.payload) {
            return Immutable.set(card, 'expanded', true);
          } else {
            return card;
          }
        });
      });
      return { model: updated };
    }
    case 'COLLAPSE_CARD': {
      updated = Immutable.update(model, 'cards', function(cards) {
        return cards.map(function(card) {
          if (card.guid === action.payload) {
            return Immutable.set(card, 'expanded', false);
          } else {
            return card;
          }
        });
      });
      return { model: updated };
    }
    default: {
      return { model: model };
    }
  }
}

function cardListPane(model, dispatch) {
  var cards = model.cards.asMutable({ deep: true }).map(function(card) {
    return cardView(card, model, dispatch);
  });

  return html`<div id="card-list-pane" class="pane">
    ${cards}
  </div>`;
}

function statsView(card) {
  return html`
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

  return html`
    <div className="${classes.cardDetailLine}">${text}</div>
  `;
}

function abilityView(card) {
  var out = html`
    <div className="${classes.cardDetailLine}"></div>
  `;

  out.innerHTML = card.text;

  return out;
}

function costView(card) {
  if (!card.cost) {
    return;
  }

  return html`
    <div className="${classes.cardDetailLine}">Cost: ${card.cost}</div>
  `;
}

function moreDetailsView(card) {
  if (!card.expanded) {
    return;
  }

  return html`
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
      debugger;
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

  var changeButton = html`
    <button className="${classes.addToDeckButton}" onclick=${addToDeck}>
      <span className="${classes.visuallyhidden}">Add To Deck</span>
    </button>
  `;

  return html`
    <div id=${card.guid} className=${classes.listItem}>
      <img className="${classes.cardThumbnail}" src="${'images/cards/small/' + card.image + '.jpg'}" />
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

function view(model, dispatch) {
  return html`
    <div class="pane-container">
      ${cardListPane(model, dispatch)}
      <div class="pane">Pane 2</div>
    </div>
  `;
}


function run(effect, sources) {
  switch(effect) {
    case 'ATTACH_TABS': {
      console.log('attach tabs');
      var notify = Notify();
      var tabEE = attach(paneContainerEl);
      tabEE.on('tab-shown', notify);
      navbarMount(navbarEl, notify.listen);
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

function render(view) {
  console.log('render');
  html.update(paneContainerEl, view);
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