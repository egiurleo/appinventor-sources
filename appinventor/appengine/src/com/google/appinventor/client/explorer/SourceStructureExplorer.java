// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2009-2011 Google, All Rights reserved
// Copyright 2011-2012 MIT, All rights reserved
// Released under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

package com.google.appinventor.client.explorer;

import com.google.appinventor.client.Ode;
import com.google.appinventor.client.output.OdeLog;
import com.google.appinventor.client.widgets.TextButton;
import com.google.gwt.event.dom.client.*;
import com.google.gwt.event.logical.shared.*;
import com.google.gwt.user.client.ui.*;
import com.google.gwt.user.client.Event;
import com.google.gwt.user.client.DOM;
import com.google.gwt.user.client.Window; // TODO @egiurleo remove this
import com.google.appinventor.client.boxes.BlockSelectorBox;

import java.util.Iterator;

import static com.google.appinventor.client.Ode.MESSAGES;

/**
 * This explorer is used to outline the structure of a source file. Note that
 * this explorer is shared by all it's clients. That means that clients (most
 * likely editors) need to update its content upon activation.
 *
 * @author lizlooney@google.com (Liz Looney)
 */
public class SourceStructureExplorer extends Composite {
  // UI elements
  private final Tree tree;
  private final TextButton renameButton;
  private final TextButton deleteButton;

  private boolean flyoutOpen = false;
  private boolean blockSelected = false;

  private BlockSelectorBox blockSelectorBox = null;
    //TODO (egiurleo): I really don't like this but I'm blanking on cleaner ways to do it

  /**
   * Creates a new source structure explorer.
   */
  public SourceStructureExplorer() {
    // Initialize UI elements
    tree = new Tree(Ode.getImageBundle()) {
      @Override
      public boolean isKeyboardNavigationEnabled(TreeItem currentItem) {
        return !blockSelected;
      }

      @Override
      public void onBrowserEvent(Event event) {
        int eventType = DOM.eventGetType(event);

        /*
         * Trees don't seem to allow you to capture arrow key events using a standard event
         *  handler, so I've created a workaround that catches Browser Events and
         *  manipulates the block drawer flyout if an arrow key is pressed -egiurleo
         */

         // TODO (egiurleo): maybe some of this stuff could be moved into the flyout code,
         //   but I'm not sure how to capture a keydown event there

        switch(eventType) {
          case Event.ONKEYDOWN:
          int keyCode = event.getKeyCode();
            if(keyCode == KeyCodes.KEY_RIGHT) {
              if(flyoutOpen) {
                blockSelectorBox.fireFirstBlockInDrawerSelected();
                updateBlockSelected(true);
              }
            } else if(keyCode == KeyCodes.KEY_UP) {
              if(blockSelected) {
                blockSelectorBox.firePreviousBlockInDrawerSelected();
              }
            } else if(keyCode == KeyCodes.KEY_DOWN) {
              if(blockSelected) {
                blockSelectorBox.fireNextBlockInDrawerSelected();
              }
            } else if(keyCode == KeyCodes.KEY_LEFT || keyCode == KeyCodes.KEY_ESCAPE || keyCode == KeyCodes.KEY_TAB) {
              if(flyoutOpen) {
                updateBlockSelected(false);
                updateFlyoutOpen(false);
                blockSelectorBox.fireBuiltinDrawerClosed();
                break;
              }
            } else if(keyCode == KeyCodes.KEY_ENTER) {
              if(blockSelected) {
                blockSelectorBox.fireAddSelectedBlockToWorkspace();
              }
            }
            super.onBrowserEvent(event);
            break;
          default:
            super.onBrowserEvent(event);
        }
      }
    };
    tree.getElement().setId("source-structure-explorer-tree");
    tree.setAnimationEnabled(true);
    tree.setTabIndex(-1); //remove this tree from the tab flow
    tree.addCloseHandler(new CloseHandler<TreeItem>() {
      @Override
      public void onClose(CloseEvent<TreeItem> event) {
        TreeItem treeItem = event.getTarget();
        if (treeItem != null) {
          Object userObject = treeItem.getUserObject();
          if (userObject instanceof SourceStructureExplorerItem) {
            SourceStructureExplorerItem item = (SourceStructureExplorerItem) userObject;
            item.onStateChange(false);
          }
        }
      }
    });
    tree.addOpenHandler(new OpenHandler<TreeItem>() {
      @Override
      public void onOpen(OpenEvent<TreeItem> event) {
        TreeItem treeItem = event.getTarget();
        if (treeItem != null) {
          Object userObject = treeItem.getUserObject();
          if (userObject instanceof SourceStructureExplorerItem) {
            SourceStructureExplorerItem item = (SourceStructureExplorerItem) userObject;
            item.onStateChange(true);
          }
        }
      }
    });
    tree.addSelectionHandler(new SelectionHandler<TreeItem>() {
      @Override
      public void onSelection(SelectionEvent<TreeItem> event) {
        TreeItem treeItem = event.getSelectedItem();
        if (treeItem != null) {
          Object userObject = treeItem.getUserObject();
          if (userObject instanceof SourceStructureExplorerItem) {
            SourceStructureExplorerItem item = (SourceStructureExplorerItem) userObject;
            enableButtons(item);
            //showBlocks(item);
            item.onSelected();
          } else {
            disableButtons();
            //hideComponent();
          }
        } else {
          disableButtons();
        }
      }
    });
    tree.addKeyDownHandler(new KeyDownHandler() {
      @Override
      public void onKeyDown(KeyDownEvent event) {
        int keyCode = event.getNativeKeyCode();
        if (keyCode == KeyCodes.KEY_DELETE || keyCode == KeyCodes.KEY_BACKSPACE) {
          event.preventDefault();
          deleteItemFromTree();
        }
      }
    });

    // Put a ScrollPanel around the tree.
    ScrollPanel scrollPanel = new ScrollPanel(tree);
    scrollPanel.setWidth("200px");  // wide enough to avoid a horizontal scrollbar most of the time
    scrollPanel.setHeight("480px"); // approximately the same height as the viewer

    HorizontalPanel buttonPanel = new HorizontalPanel();
    buttonPanel.setStyleName("ode-PanelButtons");
    buttonPanel.setSpacing(4);

    renameButton = new TextButton(MESSAGES.renameButton());
    renameButton.setEnabled(false);
    renameButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        TreeItem treeItem = tree.getSelectedItem();
        if (treeItem != null) {
          Object userObject = treeItem.getUserObject();
          if (userObject instanceof SourceStructureExplorerItem) {
            SourceStructureExplorerItem item = (SourceStructureExplorerItem) userObject;
            item.rename();
          }
        }
      }
    });
    renameButton.setTabIndex(-2); //set to -2 because gwt automatically sets tabindex -1 back to 0
    buttonPanel.add(renameButton);
    buttonPanel.setCellHorizontalAlignment(renameButton, HorizontalPanel.ALIGN_RIGHT);

    deleteButton = new TextButton(MESSAGES.deleteButton());
    deleteButton.setEnabled(false);
    deleteButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        deleteItemFromTree();
      }
    });
    deleteButton.setTabIndex(-2); //set to -2 because gwt automatically sets tabindex -1 back to 0
    buttonPanel.add(deleteButton);
    buttonPanel.setCellHorizontalAlignment(deleteButton, HorizontalPanel.ALIGN_LEFT);

    VerticalPanel panel = new VerticalPanel();
    panel.add(scrollPanel);
    panel.add(new Label());
    panel.add(buttonPanel);
    panel.setCellHorizontalAlignment(buttonPanel, HorizontalPanel.ALIGN_CENTER);
    initWidget(panel);
  }

  private void deleteItemFromTree() {
    TreeItem treeItem = tree.getSelectedItem();
    if (treeItem != null) {
      Object userObject = treeItem.getUserObject();
      if (userObject instanceof SourceStructureExplorerItem) {
        SourceStructureExplorerItem item = (SourceStructureExplorerItem) userObject;
        item.delete();
      }
    }
  }

  private void enableButtons(SourceStructureExplorerItem item) {
    renameButton.setEnabled(item.canRename());
    deleteButton.setEnabled(item.canDelete());
  }

  private void disableButtons() {
    renameButton.setEnabled(false);
    deleteButton.setEnabled(false);
  }


  /* move this logic to declarations of SourceStructureExplorerItem subtypes
  private void showBlocks(SourceStructureExplorerItem item) {
    // are we showing the blocks editor?
    if (Ode.getInstance().getCurrentFileEditor() instanceof YaBlocksEditor) {
      YaBlocksEditor editor =
          (YaBlocksEditor) Ode.getInstance().getCurrentFileEditor();
      OdeLog.log("Showing item " + item.getItemName());
      if (item.isComponent()) {
        editor.showComponentBlocks(item.getItemName());
      } else {
        editor.showBuiltinBlocks(item.getItemName());
      }
    }
  }

  private void hideComponent() {
    if (Ode.getInstance().getCurrentFileEditor() instanceof YaBlocksEditor) {
      YaBlocksEditor editor =
          (YaBlocksEditor) Ode.getInstance().getCurrentFileEditor();
      OdeLog.log("Hiding selected item");
      editor.hideComponentBlocks();
    }
  }
   */

  /**
   * Clears the tree.
   */
  public void clearTree() {
    tree.clear();
    disableButtons();
  }

  /**
   * Updates the tree
   *
   * @param root the new root TreeItem
   * @param itemToSelect item to select, or null for no selected item
   */
  public void updateTree(TreeItem root, SourceStructureExplorerItem itemToSelect) {
    TreeItem items[] = new TreeItem[1];
    items[0] = root;
    updateTree(items, itemToSelect);
  }


  /**
   * Updates the tree
   *
   * @param roots An array of root items (all top level)
   * @param itemToSelect item to select, or null for no selected item
   */
  public void updateTree(TreeItem[] roots, SourceStructureExplorerItem itemToSelect) {
    tree.clear();
    for (TreeItem root : roots) {
      tree.addItem(root);
    }
    if (itemToSelect != null) {
      selectItem(itemToSelect, true);
    } else {
      disableButtons();
    }
  }

  /**
   * Sets screen focus on the tree (for keyboard accessibility)
   *
   * @param bool whether you're focusing the tree
   */
  public void setFocus(boolean bool) {
    tree.setFocus(bool);
  }

  /**
   * Select or unselect an item in the tree
   *
   * @param item to select or unselect
   * @param select true to select, false to unselect
   */
  private void selectItem(SourceStructureExplorerItem item, boolean select) {
    Iterator<TreeItem> iter = tree.treeItemIterator();
    while (iter.hasNext()) {
      TreeItem treeItem = iter.next();
      if (item.equals(treeItem.getUserObject())) {
        // NOTE(lizlooney) - It turns out that calling TreeItem.setSelected(true) doesn't actually
        // select the item in the tree. It looks selected, but Tree.getSelectedItem() will return
        // null. Instead, we have to call Tree.setSelectedItem.
        if (select) {
          tree.setSelectedItem(treeItem, false); // false means don't trigger a SelectionEvent
          enableButtons(item);
          //showBlocks(item);
        } else {
          tree.setSelectedItem(null, false); // false means don't trigger a SelectionEvent
          disableButtons();
          //hideComponent();
        }
        break;
      }
    }
  }

  /**
   * Select an item in the tree
   *
   * @param item item to select
   */
  public void selectItem(SourceStructureExplorerItem item) {
    selectItem(item, true);
  }

  /**
   * Select an item in the tree
   *
   * @param item item to unselect
   */
  public void unselectItem(SourceStructureExplorerItem item) {
    selectItem(item, false);
  }

  /**
   * Enable or disable arrow key use by saying whether the blocks flyout is open;
   *  if the flyout is open, the keyboard navigation on the tree should NOT be enabled
   *
   * @param bool whether the flyout is open
   */
  public void updateFlyoutOpen(boolean bool) {
    flyoutOpen = bool;
  }

  /**
   * Say whether a block has been selected in the blocks flyout drawer
   *
   * @param bool whether there is a selected block in the flyout
   */
  public void updateBlockSelected(boolean bool) {
    blockSelected = bool;
  }

  /**
   * Give a reference to the BlockSelectorBox so that the SourceStructureExplorer can
   *  fire an event selecting the first block in the flyout
   *
   *  TODO (egiurleo): I don't like this but I can't think of a nicer way to do it right now
   *
   * @param box the BlockSelectorBox this
   */
  public void setBox(BlockSelectorBox box) {
    blockSelectorBox = box;
  }
}
