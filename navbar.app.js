'use strict';

var inu = require('inu');
var start = inu.start;
var pull = inu.pull;
var yo = require('yo-yo');

var xtend = require('xtend');

function mount(mountEl, notifyListen) {

  var listener = notifyListen();

  function init() {
    var model = {
      tabs: [{ title: 'Cards', url: '/' }, { title: 'Deck', url: '/deck' }],
      tabIndex: 0
    };

    return {
      model: model,
      effect: 'UPDATE_LISTEN'
    };
  }

  function update(model, action) {
    switch(action.type) {
      case 'UPDATE_NAVBAR': {
        console.log('update navbar');
        var updated = xtend(model, { tabIndex: action.payload });
        return {
          model: updated
        }
      }
      default: {
        return { model: model }
      }
    }
  }

  function view(model) {
    var navitems = model.tabs.map(function(tab, idx) {
      var classes = ['navitem'];
      if (model.tabIndex === idx) {
        classes.push('selected');
      }

      return yo`<a class="${classes.join(' ')}" href="${tab.url}">${tab.title}</a>`
    });

    return yo`
      <nav class="navbar">
        ${navitems}
      </nav>
    `;
  }

  function run(effect, sources) {
    switch(effect) {
      case 'UPDATE_LISTEN': {
        console.log('update listen');
        return pull(
          listener,
          pull.map(function(tabIndex) {
            return {
              type: 'UPDATE_NAVBAR',
              payload: tabIndex
            };
          })
        )
      }
    }
  }

  var sources = start({
    init: init,
    update: update,
    view: view,
    run: run
  });

  function renderNavbar(view) {
    console.log('render navbar');
    yo.update(mountEl, view);
  }

  pull(
    sources.views(),
    pull.drain(renderNavbar)
  )

}

module.exports = mount;