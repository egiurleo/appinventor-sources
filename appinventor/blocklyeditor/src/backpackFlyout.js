/**
 * Visual Blocks Editor
 *
 * Copyright © 2011 Google Inc.
 * Copyright © 2011-2016 Massachusetts Institute of Technology
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview backpack flyout.
 * @author fraser@google.com (Neil Fraser)
 * @author vbrown@wellesley.edu (Tori Brown)
 * @author ewpatton@mit.edu (Evan W. Patton)
 */

 'use strict';

goog.provide('Blockly.BackpackFlyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.userAgent');

Blockly.BackpackFlyout = function(workspaceOptions) {
  Blockly.BackpackFlyout.superClass_.constructor.call(this, workspaceOptions);
  // Backpack flyout is opposite the blocks flyout
  this.toolboxPosition_ = this.RTL ? Blockly.TOOLBAR_AT_LEFT : Blockly.TOOLBOX_AT_RIGHT;
};
goog.inherits(Blockly.BackpackFlyout, Blockly.Flyout);

/**
 * Creates the flyout's DOM.  Only needs to be called once.
 * @return {!Element} The flyout's SVG group.
 */
Blockly.BackpackFlyout.prototype.createDom = function() {
  Blockly.Flyout.prototype.createDom.call(this);
  this.svgBackground_.setAttribute('class', 'blocklybackpackFlyoutBackground');
  return this.svgGroup_;
};

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.BackpackFlyout.prototype.dispose = function() {
  this.hide();
  Blockly.unbindEvent_(this.eventWrappers_);
  this.eventWrappers_.length = 0;
  if (this.scrollbar_) {
    this.scrollbar_.dispose();
    this.scrollbar_ = null;
  }
  this.workspace_ = null;
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBackground_ = null;
  this.targetWorkspace_ = null;
};

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.Flyout} flyout Instance of the flyout.
 * @param {!Blockly.Block} originBlock The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
/*
Blockly.BackpackFlyout.prototype.createBlockFunc_ = function(originBlock) {
  var flyout = this;
  return function(e) {
    if (Blockly.isRightButton(e)) {
      // Right-click.  Don't create a block, let the context menu show.
      return;
    }
    if (originBlock.disabled) {
      // Beyond capacity.
      return;
    }
    // Create the new block by cloning the block in the flyout (via XML).
    var xml = Blockly.Xml.blockToDom(originBlock);
    var block = Blockly.Xml.domToBlock(xml, flyout.targetWorkspace_);
    // Place it in the same spot as the flyout copy.
    var svgRoot = originBlock.getSvgRoot();
    if (!svgRoot) {
      throw 'originBlock is not rendered.';
    }
    var xyOld = Blockly.getSvgXY_(svgRoot, flyout.targetWorkspace_);
    var xyNew = Blockly.getSvgXY_(flyout.targetWorkspace_.getCanvas(), Blockly.getMainWorkspace());
    block.moveBy(xyOld.x - xyNew.x, xyOld.y - xyNew.y);
    block.render();
    if (flyout.autoClose) {
      flyout.hide();
    } else {
      flyout.filterForCapacity_();
    }

    // Start a dragging operation on the new block.
    block.onMouseDown_(e);
  };
};
*/

/**
 * Filter the blocks on the flyout to disable the ones that are above the
 * capacity limit.
 */
Blockly.BackpackFlyout.prototype.filterForCapacity_ = function() {
  if (!this.targetWorkspace_) return;
  var remainingCapacity = this.targetWorkspace_.remainingCapacity();
  var blocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    var allBlocks = block.getDescendants();
    var disabled = allBlocks.length > remainingCapacity;
    block.setDisabled(disabled);
  }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.BackpackFlyout.terminateDrag_ = function() {
  if (Blockly.BackpackFlyout.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.BackpackFlyout.onMouseUpWrapper_);
    Blockly.BackpackFlyout.onMouseUpWrapper_ = null;
  }
  if (Blockly.BackpackFlyout.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.BackpackFlyout.onMouseMoveWrapper_);
    Blockly.BackpackFlyout.onMouseMoveWrapper_ = null;
  }
  Blockly.BackpackFlyout.startDownEvent_ = null;
  Blockly.BackpackFlyout.startBlock_ = null;
  Blockly.BackpackFlyout.startFlyout_ = null;
};
