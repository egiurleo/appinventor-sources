// -*- mode: java; c-basic-offset: 2; -*-
// Copyright © 2016 Massachusetts Institute of Technology. All rights reserved.

/**
 * @license
 * @fileoverview Visual blocks editor for MIT App Inventor
 * Add additional functions to Blockly namespace
 *
 * @author ewpatton@mit.edu (Evan W. Patton)
 */

'use strict';

goog.provide('AI.Blockly');

goog.require('Blockly');

// App Inventor extensions to Blockly
goog.require('AI.Blockly.Instrument');
goog.require('Blockly.TypeBlock');
goog.require('AI.Blockly.WorkspaceSvg');

/**
 * ENUM for an indented value input.  Similar to next_statement but with value
 * input shape.
 * @const
 */
Blockly.INDENTED_VALUE = 6;

/**
 * Path to Blockly's directory.  Can be relative, absolute, or remote.
 * Used for loading additional resources.
 */
Blockly.pathToBlockly = './';

Blockly.hideChaff = (function(func) {
  if (func.isWrapped) {
    return func;
  } else {
    var f = function() {
      func.apply(this, Array.prototype.slice.call(arguments));
      // [lyn, 10/06/13] for handling parameter & procedure flydowns
      Blockly.FieldFlydown && Blockly.FieldFlydown.hide();
      Blockly.TypeBlock && Blockly.TypeBlock.hide();
    };
    f.isWrapped = true;
    return f;
  }
})(Blockly.hideChaff);

Blockly.getMainWorkspaceMetrics_ = function() {
  return Blockly.getMainWorkspace().getMetrics();
};
