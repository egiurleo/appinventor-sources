package com.google.appinventor.client.editor.adapters;

import com.google.appinventor.client.editor.simple.components.MockComponent;
import com.google.gwt.core.client.JavaScriptObject;

public class ComponentAdapter extends JavaScriptObject implements IComponent {

  protected ComponentAdapter() {
  }

  public static native IComponent create(DesignerAdapter editor, MockComponent component)/*-{
    return new AI.Adapter.Component(editor, component);
  }-*/;
}
