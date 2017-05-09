// -*- mode: java; c-basic-offset: 2; -*-
// Copyright © 2012-2016 Massachusetts Institute of Technology. All rights reserved.

/**
 * @license
 * @fileoverview Visual blocks editor for MIT App Inventor
 * Initialize the blocks editor workspace.
 *
 * @author mckinney@mit.edu (Andrew F. McKinney)
 * @author sharon@google.com (Sharon Perl)
 * @author ewpatton@mit.edu (Evan W. Patton)
 */

'use strict';

goog.provide('AI.Blockly.BlocklyEditor');

goog.require('AI.Blockly.Drawer');

// App Inventor extensions to Blockly
goog.require('Blockly.TypeBlock');

if (Blockly.BlocklyEditor === undefined) {
  Blockly.BlocklyEditor = {};
}

Blockly.allWorkspaces = {};

Blockly.configForTypeBlock = {
  frame: 'ai_frame',
  typeBlockDiv: 'ai_type_block',
  inputText: 'ac_input_text'
};

Blockly.BlocklyEditor.render = function() {
};

/**
 * Add a "Do It" option to the context menu for every block. If the user is an admin also
 * add a "Generate Yail" option to the context menu for every block. The generated yail will go in
 * the block's comment (if it has one) for now.
 * TODO: eventually create a separate kind of bubble for the generated yail, which can morph into
 * the bubble for "do it" output once we hook up to the REPL.
 */
Blockly.Block.prototype.customContextMenu = function(options) {
  var myBlock = this;
  var doitOption = { enabled: !this.disabled};
  if (window.parent.BlocklyPanel_checkIsAdmin()) {
    var yailOption = {enabled: !this.disabled};
    yailOption.text = Blockly.Msg.GENERATE_YAIL;
    yailOption.callback = function() {
      var yailText;
      //Blockly.Yail.blockToCode1 returns a string if the block is a statement
      //and an array if the block is a value
      var yailTextOrArray = Blockly.Yail.blockToCode1(myBlock);
      if(yailTextOrArray instanceof Array){
        yailText = yailTextOrArray[0];
      } else {
        yailText = yailTextOrArray;
      }
      myBlock.setCommentText(yailText);
    };
    options.push(yailOption);
  }
  doitOption.text = Blockly.Msg.DO_IT;
  doitOption.callback = function() {
    var yailText;
    //Blockly.Yail.blockToCode1 returns a string if the block is a statement
    //and an array if the block is a value
    var yailTextOrArray = Blockly.Yail.blockToCode1(myBlock);
    var dialog;
    if (window.parent.ReplState.state != Blockly.ReplMgr.rsState.CONNECTED) {
      dialog = new goog.ui.Dialog(null, true);
      dialog.setTitle(Blockly.Msg.CAN_NOT_DO_IT);
      dialog.setTextContent(Blockly.Msg.CONNECT_TO_DO_IT);
      dialog.setButtonSet(new goog.ui.Dialog.ButtonSet().
        addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.OK,
          false, true));
      dialog.setVisible(true);
    } else {
      if(yailTextOrArray instanceof Array){
        yailText = yailTextOrArray[0];
      } else {
        yailText = yailTextOrArray;
      }
      Blockly.ReplMgr.putYail(yailText, myBlock);
    }
  };
  options.push(doitOption);
  //Option to clear error generated by Do It
  if(myBlock.replError){
    var clearDoitOption = {enabled: true};
    clearDoitOption.text = Blockly.Msg.CLEAR_DO_IT_ERROR;
    clearDoitOption.callback = function() {
      myBlock.replError = null;
      Blockly.getMainWorkspace().getWarningHandler().checkErrors(myBlock);
    };
    options.push(clearDoitOption);
  }
  if(myBlock.procCustomContextMenu){
    myBlock.procCustomContextMenu(options);
  }
};

/* [Added by paulmw in patch 15]
   There are three ways that you can change how lexical variables
   are handled:

   1. Show prefixes to users, and separate namespace in yail
   Blockly.showPrefixToUser = true;
   Blockly.usePrefixInYail = true;

   2. Show prefixes to users, lexical variables share namespace yail
   Blockly.showPrefixToUser = true;
   Blockly.usePrefixInYail = false;

   3. Hide prefixes from users, lexical variables share namespace yail
   //The default (as of 12/21/12)
   Blockly.showPrefixToUser = false;
   Blockly.usePrefixInYail = false;

   It is not possible to hide the prefix and have separate namespaces
   because Blockly does not allow to items in a list to have the same name
   (plus it would be confusing...)

*/

Blockly.showPrefixToUser = false;
Blockly.usePrefixInYail = false;

/******************************************************************************
   [lyn, 12/23-27/2012, patch 16]
     Prefix labels for parameters, locals, and index variables,
     Might want to experiment with different combintations of these. E.g.,
     + maybe all non global parameters have prefix "local" or all have prefix "param".
     + maybe index variables have prefix "index", or maybe instead they are treated as "param"
*/

Blockly.globalNamePrefix = "global"; // For names introduced by global variable declarations
Blockly.procedureParameterPrefix = "input"; // For names introduced by procedure/function declarations
Blockly.handlerParameterPrefix = "input"; // For names introduced by event handlers
Blockly.localNamePrefix = "local"; // For names introduced by local variable declarations
Blockly.loopParameterPrefix = "item"; // For names introduced by for loops
Blockly.loopRangeParameterPrefix = "counter"; // For names introduced by for range loops

Blockly.menuSeparator = " "; // Separate prefix from name with this. E.g., space in "param x"
Blockly.yailSeparator = "_"; // Separate prefix from name with this. E.g., underscore "param_ x"

// Curried for convenient use in field_lexical_variable.js
Blockly.possiblyPrefixMenuNameWith = // e.g., "param x" vs "x"
function (prefix) {
  return function (name) {
    return (Blockly.showPrefixToUser ? (prefix + Blockly.menuSeparator) : "") + name;
  }
};

// Curried for convenient use in generators/yail/variables.js
Blockly.possiblyPrefixYailNameWith = // e.g., "param_x" vs "x"
function (prefix) {
  return function (name) {
    return (Blockly.usePrefixInYail ? (prefix + Blockly.yailSeparator) : "") + name;
  }
};

Blockly.prefixGlobalMenuName = function (name) {
  return Blockly.globalNamePrefix + Blockly.menuSeparator + name;
};

// Return a list of (1) prefix (if it exists, "" if not) and (2) unprefixed name
Blockly.unprefixName = function (name) {
  if (name.indexOf(Blockly.globalNamePrefix + Blockly.menuSeparator) == 0) {
    // Globals always have prefix, regardless of flags. Handle these specially
    return [Blockly.globalNamePrefix, name.substring(Blockly.globalNamePrefix.length + Blockly.menuSeparator.length)];
  } else if (!Blockly.showPrefixToUser) {
    return ["", name];
  } else {
    var prefixes = [Blockly.procedureParameterPrefix,
                    Blockly.handlerParameterPrefix,
                    Blockly.localNamePrefix,
                    Blockly.loopParameterPrefix,
                    Blockly.loopRangeParameterPrefix];
    for (i=0; i < prefixes.length; i++) {
      if (name.indexOf(prefixes[i]) == 0) {
        // name begins with prefix
        return [prefixes[i], name.substring(prefixes[i].length + Blockly.menuSeparator.length)]
      }
    }
    // Really an error if get here ...
    return ["", name];
  }
};

/**
 * Create a new Blockly workspace but without initializing its DOM.
 * @param container The container that will host the Blockly workspace
 * @param formName The projectId_formName identifier used to name the workspace
 * @param readOnly True if the workspace should be created read-only
 * @param rtl True if the workspace is using a right-to-left language
 * @returns {Blockly.WorkspaceSvg} A newly created workspace
 */
Blockly.BlocklyEditor['create'] = function(container, formName, readOnly, rtl) {
  var options = new Blockly.Options({
    'readOnly': readOnly,
    'rtl': rtl,
    'collapse': true,
    'scrollbars': true,
    'trashcan': true,
    'comments': true,
    'disable': true,
    'media': './assets/',
    'grid': {'spacing': '20', 'length': '5', 'snap': true, 'colour': '#ccc'},
    'zoom': {'controls': true, 'wheel': true, 'scaleSpeed': 1.1, 'maxScale': 3, 'minScale': 0.1}
  });

  var subContainer = goog.dom.createDom('div', 'injectionDiv');
  subContainer.setAttribute('tabindex', '0');  // make injection div focusable
  container.appendChild(subContainer);
  var svg = Blockly.createDom_(subContainer, options);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  // Create surfaces for dragging things. These are optimizations
  // so that the broowser does not repaint during the drag.
  var blockDragSurface = new Blockly.BlockDragSurfaceSvg(subContainer);
  var workspaceDragSurface = new Blockly.workspaceDragSurfaceSvg(subContainer);

  var workspace = new Blockly.WorkspaceSvg(options, blockDragSurface, workspaceDragSurface);
  Blockly.allWorkspaces[formName] = workspace;
  workspace.formName = formName;
  workspace.rendered = false;
  workspace.componentDb_ = new Blockly.ComponentDatabase();
  workspace.procedureDb_ = new Blockly.ProcedureDatabase(workspace);
  workspace.variableDb_ = new Blockly.VariableDatabase();
  workspace.blocksNeedingRendering = [];
  workspace.addWarningHandler();
  if (!readOnly) {
    var ai_type_block = goog.dom.createElement('div'),
      p = goog.dom.createElement('p'),
      ac_input_text = goog.dom.createElement('input'),
      typeblockOpts = {
        frame: container,
        typeBlockDiv: ai_type_block,
        inputText: ac_input_text
      };
    // build dom for typeblock (adapted from blocklyframe.html)
    goog.style.setElementShown(ai_type_block, false);
    goog.dom.classlist.add(ai_type_block, "ai_type_block");
    goog.dom.insertChildAt(container, ai_type_block, 0);
    goog.dom.appendChild(ai_type_block, p);
    goog.dom.appendChild(p, ac_input_text);
    workspace.typeBlock_ = new Blockly.TypeBlock(typeblockOpts, workspace);
  }
  return workspace;
};

/**
 * Inject a previously constructed workspace into the designated
 * container. This implementation is adapted from Blockly's
 * implementation and is required due to the fact that browsers such as
 * Firefox do not initialize SVG elements unless they are visible.
 *
 * @param {!Element|string} container
 * @param {!Blockly.WorkspaceSvg} workspace
 */
Blockly.ai_inject = function(container, workspace) {
  Blockly.mainWorkspace = workspace;  // make workspace the 'active' workspace
  workspace.fireChangeListener(new AI.Events.ScreenSwitch(workspace.projectId, workspace.formName));
  var gridEnabled = top.BlocklyPanel_getGridEnabled && top.BlocklyPanel_getGridEnabled();
  var gridSnap = top.BlocklyPanel_getSnapEnabled && top.BlocklyPanel_getSnapEnabled();
  if (workspace.injected) {
    workspace.setGridSettings(gridEnabled, gridSnap);
    // Update the workspace size in case the window was resized while we were hidden
    setTimeout(function() {
      goog.array.forEach(workspace.blocksNeedingRendering, function(block) {
        workspace.getWarningHandler().checkErrors(block);
        block.render();
      });
      workspace.blocksNeedingRendering.splice(0);  // clear the array of pending blocks
      workspace.resizeContents();
      Blockly.svgResize(workspace);
    });
    return;
  }
  var options = workspace.options;
  var svg = container.querySelector('svg.blocklySvg');
  svg.cachedWidth_ = svg.clientWidth;
  svg.cachedHeight_ = svg.clientHeight;
  svg.appendChild(workspace.createDom('blocklyMainBackground'));
  workspace.setGridSettings(gridEnabled, gridSnap);
  workspace.translate(0, 0);
  if (!options.readOnly && !options.hasScrollbars) {
    var workspaceChanged = function() {
      if (Blockly.dragMode_ == Blockly.DRAG_NONE) {
        var metrics = workspace.getMetrics();
        var edgeLeft = metrics.viewLeft + metrics.absoluteLeft;
        var edgeTop = metrics.viewTop + metrics.absoluteTop;
        if (metrics.contentTop < edgeTop ||
            metrics.contentTop + metrics.contentHeight > metrics.viewHeight + edgeTop ||
            metrics.contentLeft < (options.RTL ? metrics.viewLeft : edgeLeft) ||
            metrics.contentLeft + metrics.contentWidth > (options.RTL ?
                metrics.viewWidth : metrics.viewWidth + edgeLeft)) {
          // One or more blocks may be out of bounds.  Bump them back in.
          var MARGIN = 25;
          var blocks = workspace.getTopBlocks(false);
          for (var b = 0, block; block = blocks[b]; b++) {
            var blockXY = block.getRelativeToSurfaceXY();
            var blockHW = block.getHeightWidth();
            // Bump any block that's above the top back inside.
            var overflowTop = edgeTop + MARGIN - blockHW.height - blockXY.y;
            if (overflowTop > 0) {
              block.moveBy(0, overflowTop);
            }
            // Bump any block that's below the bottom back inside.
            var overflowBottom =
                edgeTop + metrics.viewHeight - MARGIN - blockXY.y;
            if (overflowBottom < 0) {
              block.moveBy(0, overflowBottom);
            }
            // Bump any block that's off the left back inside.
            var overflowLeft = MARGIN + edgeLeft -
                blockXY.x - (options.RTL ? 0 : blockHW.width);
            if (overflowLeft > 0) {
              block.moveBy(overflowLeft, 0);
            }
            // Bump any block that's off the right back inside.
            var overflowRight = edgeLeft + metrics.viewWidth - MARGIN -
                blockXY.x + (options.RTL ? blockHW.width : 0);
            if (overflowRight < 0) {
              block.moveBy(overflowRight, 0);
            }
          }
        }
      }
    };
    workspace.addChangeListener(workspaceChanged);
  }
  // The SVG is now fully assembled.
  Blockly.WidgetDiv.createDom();
  Blockly.Tooltip.createDom();
  workspace.drawer_ = new Blockly.Drawer(workspace, { scrollbars: true });
  workspace.flyout_ = workspace.drawer_.flyout_;
  var flydown = new Blockly.Flydown(new Blockly.Options({scrollbars: false}));
  // ***** [lyn, 10/05/2013] NEED TO WORRY ABOUT MULTIPLE BLOCKLIES! *****
  workspace.flydown_ = flydown;
  Blockly.utils.insertAfter_(flydown.createDom('g'), workspace.svgBubbleCanvas_);
  flydown.init(workspace);
  flydown.autoClose = true; // Flydown closes after selecting a block
  workspace.addWarningIndicator();
  workspace.addBackpack();
  Blockly.init_(workspace);
  workspace.markFocused();
  Blockly.bindEvent_(svg, 'focus', workspace, workspace.markFocused);
  workspace.resize();
  // Render blocks created prior to the workspace being rendered.
  workspace.rendered = true;
  var blocks = workspace.getAllBlocks();

  /**
   * Creates a new helper function to render a comment set to visible but deferred during workspace
   * generation.
   * @param {!Blockly.Comment} comment The Blockly Comment object to be made visible.
   * @returns {Function}
   */
  function commentRenderer(comment) {
    return function() {
      comment.setVisible(comment.visible);
    }
  }

  for (var i = blocks.length - 1; i >= 0; i--) {
    var block = blocks[i];
    block.initSvg();
    block.rendered = true;
    if (block.disabled && block.updateDisabled) {
      block.updateDisabled();
    }
    if (!isNaN(block.x) && !isNaN(block.y)) {
      var xy = block.getRelativeToSurfaceXY();
      block.getSvgRoot().setAttribute('transform',
        'translate(' + block.x + ',' + block.y + ')');
      block.moveConnections_(block.x - xy.x, block.y - xy.y);
    }
    if (block.comment && block.comment.visible && block.comment.setVisible) {
      setTimeout(commentRenderer(block.comment), 1);
    }
  }
  workspace.render();
  // blocks = workspace.getTopBlocks();
  // for (var i = blocks.length - 1; i >= 0; i--) {
  //   var block = blocks[i];
  //   block.render(false);
  // }
  workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();
  // center on blocks
  workspace.setScale(1);
  workspace.scrollCenter();
  // done injection
  workspace.injecting = false;
  workspace.injected = true;
  // Add pending resize event to fix positioning issue in Firefox.
  setTimeout(function() { workspace.resizeContents(); Blockly.svgResize(workspace); });
  return workspace;
};

// Preserve Blockly during Closure and GWT optimizations
window['Blockly'] = Blockly;
top['Blockly'] = Blockly;
window['AI'] = AI;
top['AI'] = AI;
