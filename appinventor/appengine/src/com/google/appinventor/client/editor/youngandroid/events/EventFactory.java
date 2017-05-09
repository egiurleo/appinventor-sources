package com.google.appinventor.client.editor.youngandroid.events;

import com.google.gwt.core.client.GWT;
import com.google.gwt.core.client.JavaScriptObject;
import com.google.gwt.query.client.builders.JsniBundle.LibrarySource;

public class EventFactory {
  
  private interface EventFactorySources {
    @LibrarySource("events.js")
    public void load();
  }
  
  static {
    ((EventFactorySources) GWT.create(EventFactorySources.class)).load();
  }
  
  public static native AppInventorEvent fromJson(JavaScriptObject json)/*-{
    return null;
  }-*/;
  
  public static native AppInventorEvent create(String type, Object... args)/*-{
  }-*/;

  public static native CreateComponent create(long projectId, String uuid, String componentType)/*-{
    $wnd.EventFactory.constructors[@com.google.appinventor.client.editor.youngandroid.events.CreateComponent::TYPE
  }-*/;

  static native void registerEventType(String type, JavaScriptObject constructor, JavaScriptObject fromJson)/*-{
    $wnd.EventFactory.constructors[type] = constructor;
    $wnd.EventFactory.fromJson[type] = fromJson;
  }-*/;
}
