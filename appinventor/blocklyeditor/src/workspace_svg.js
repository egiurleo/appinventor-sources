// -*- mode: java; c-basic-offset: 2; -*-
// Copyright © 2016 Massachusetts Institute of Technology. All rights reserved.

/**
 * @license
 * @fileoverview Visual blocks editor for MIT App Inventor
 * App Inventor extensions to Blockly's SVG Workspace
 *
 * @author ewpatton@mit.edu (Evan W. Patton)
 */

'use strict';

goog.provide('AI.Blockly.WorkspaceSvg');

goog.require('Blockly.WorkspaceSvg');

/**
 * The workspace's backpack (if any).
 * @type {Blockly.Backpack}
 */
Blockly.WorkspaceSvg.prototype.backpack_ = null;

/**
 * latest clicked position is used to open the type blocking suggestions window
 * Initial position is 0,0
 * @type {{x: number, y: number}}
 */
Blockly.WorkspaceSvg.prototype.latestClick = { x: 0, y: 0 }

/**
 * Wrap the onMouseClick_ event to handle additional behaviors.
 */
Blockly.WorkspaceSvg.prototype.onMouseDown_ = (function(func) {
  if (func.isWrapped) {
    return func;
  } else {
    var f = function(e) {
      try {
        this.latestClick = { x: e.clientX, y: e.clientY };
        return func.call(this, e);
      } finally {
        //if drawer exists and supposed to close
        if (this.drawer_ && this.drawer_.flyout_.autoClose) {
          this.drawer_.hide();
        }
        if (this.backpack && this.backpack.flyout_.autoClose) {
          this.backpack.hide();
        }

        //Closes mutators
        var blocks = this.getAllBlocks();
        var numBlocks = blocks.length;
        var temp_block = null;
        for(var i = 0; i < numBlocks; i++) {
          temp_block = blocks[i];
          if(temp_block.mutator){
            //deselect block in mutator workspace
            if(Blockly.selected && Blockly.selected.workspace && Blockly.selected.workspace!=Blockly.mainWorkspace){
              Blockly.selected.unselect();
            }
            blocks[i].mutator.setVisible(false);
          }
        }
      }
    };
    f.isWrapper = true;
    return f;
  }
})(Blockly.WorkspaceSvg.prototype.onMouseDown_);

Blockly.WorkspaceSvg.prototype.createDom = (function(func) {
    if (func.isWrapped) {
      return func;
    } else {
      var f = function() {
        var svg = func.apply(this, Array.prototype.slice.call(arguments));
        return svg;
      };
      f.isWrapper = true;
      return f;
    }
  })(Blockly.WorkspaceSvg.prototype.createDom);

Blockly.WorkspaceSvg.prototype.dispose = (function(func) {
    if (func.isWrapped) {
      return func;
    } else {
      var wrappedFunc = function() {
        func.call(this);
        if (this.backpack_) {
          this.backpack_.dispose();
          return null;
        }
      };
      wrappedFunc.isWrapped = true;
      return wrappedFunc;
    }
  })(Blockly.WorkspaceSvg.prototype.dispose);

/**
 * Adds the warning indicator.
 */
Blockly.WorkspaceSvg.prototype.addWarningIndicator = function() {
  if (this.options.enableWarningIndicator && !this.options.readOnly && this.warningIndicator_ == null) {
    this.warningIndicator_ = new Blockly.WarningIndicator(this);
    var svgWarningIndicator = this.warningIndicator_.createDom();
    this.svgGroup_.appendChild(svgWarningIndicator);
    this.warningIndicator_.init();
  }
};

/**
 * Add a backpack.
 */
Blockly.WorkspaceSvg.prototype.addBackpack = function() {
  if (Blockly.Backpack && !Blockly.readOnly) {
    this.backpack = new Blockly.Backpack(this, {scrollbars: true, media: './media/'});
    var svgBackpack = this.backpack.createDom();
    this.svgGroup_.appendChild(svgBackpack);
    this.backpack.init();
  }
};

/**
 * Handle backpack rescaling
 */
Blockly.WorkspaceSvg.prototype.setScale = (function(func) {
  if (func.isWrapped) {
    return func;
  } else {
    var wrappedFunction = function(newScale) {
      func.call(this, newScale);
      if (this.backpack) {
        this.backpack.flyout_.reflow();
      }
    };
    wrappedFunction.isWrapped = true;
    return wrappedFunction;
  }
})(Blockly.WorkspaceSvg.prototype.setScale);
