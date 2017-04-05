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
      token: {}
    }),
    effect: 'ATTACH_TABS'
  };
}

function increment(count) {
  count = count || 0;
  return count + 1;
}

function update(model, action) {
  var updated;

  switch(action.type) {
    case 'ADD_MC': {
      updated = Immutable.updateIn(model, ['mc', action.payload], increment);
      return { model: updated };
    }
    case 'ADD_LOCATION': {
      updated = Immutable.updateIn(model, ['location', action.payload], increment);
      return { model: updated };
    }
    case 'ADD_SC': {
      updated = Immutable.updateIn(model, ['sc', action.payload], increment);
      return { model: updated };
    }
    case 'ADD_PT': {
       updated = Immutable.updateIn(model, ['pt', action.payload], increment);
      return { model: updated };
    }
    case 'ADD_EQUIPMENT': {
       updated = Immutable.updateIn(model, ['equipment', action.payload], increment);
      return { model: updated };
    }
    case 'ADD_TOKEN': {
       updated = Immutable.updateIn(model, ['token', action.payload], increment);
      return { model: updated };
    }
    default: {
      return { model: model };
    }
  }
}

function cardListPane(model, dispatch) {
  var cards = data.map(function(card) {
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
      type = 'ADD_MC'
      used = Immutable.getIn(model, ['mc', card.guid], 0);
      break;
    case 'Supporting character':
      type = 'ADD_SC';
      used = Immutable.getIn(model, ['sc', card.guid], 0);
      break;
    case 'Plot twist':
      type = 'ADD_PT';
      used = Immutable.getIn(model, ['pt', card.guid], 0);
      break;
    case 'Location':
    case 'Special Location':
      type = 'ADD_LOCATION';
      used = Immutable.getIn(model, ['location', card.guid], 0);
      break;
    case 'Equipment':
      type = 'ADD_EQUIPMENT';
      used = Immutable.getIn(model, ['equipment', card.guid], 0);
      break;
    case '':
    case 'Facehugger Pile':
      type = 'ADD_TOKEN';
      used = Immutable.getIn(model, ['token', card.guid], 0);
      break;
    default:
      debugger;
  }
  var addToDeck = dispatch.bind(null, { type: type, payload: card.guid });

  var changeButton = html`
    <button className="${classes.addToDeckButton}" onclick=${addToDeck}>
      <span className="${classes.visuallyhidden}">Add To Deck</span>
    </button>
  `;

  return html`
    <div id=${card.guid} className=${classes.listItem}>
      <img className="${classes.cardThumbnail}" src="${'images/cards/small/' + card.image + '.jpg'}" />
      <div className="${classes.cardDetails}">
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