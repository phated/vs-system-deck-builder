'use strict';

var inu = require('inu');
var start = inu.start;
var pull = inu.pull;
var html = inu.html;

var xtend = require('xtend');

function dotbarView(paneCount, selected) {
  var dots = [];
  for (var x = 0; x < paneCount; x++) {
    var dot;
    if (x === selected) {
      dot = html`<span className="dot-selected"></span>`;
    } else {
      dot = html`<span></span>`;
    }
    dot.innerHTML = '&middot;';
    dots.push(dot);
  }
  var dotbar = html`<div className="dotbar">
    ${dots}
  </div>`;

  return dotbar;
}

function mount(mountEl, notifyListen) {

  function init() {
    var model = {
      tabs: ['Card List', 'Deck List'],
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
    return html`
      <nav class="navbar">
        <div>${model.tabs[model.tabIndex]}</div>
        ${dotbarView(model.tabs.length, model.tabIndex)}
      </nav>
    `;
  }

  function run(effect, sources) {
    switch(effect) {
      case 'UPDATE_LISTEN': {
        console.log('update listen');
        return pull(
          notifyListen(),
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
    html.update(mountEl, view);
  }

  pull(
    sources.views(),
    pull.drain(renderNavbar)
  )

}

module.exports = mount;