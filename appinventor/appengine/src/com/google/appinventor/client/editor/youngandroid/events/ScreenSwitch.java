package com.google.appinventor.client.editor.youngandroid.events;

import com.google.gwt.core.client.JavaScriptObject;

public final class ScreenSwitch extends JavaScriptObject implements ScreenEvent {
  public static final String TYPE;

  static {
    TYPE = init(ScreenSwitch.class);
  }

  protected ScreenSwitch() {}

  private static native String init(Class<ScreenSwitch> clazz)/*-{
    clazz.jsType = AI.Events.ScreenSwitch;
    return clazz.jsType.prototype.type;
  }-*/;

  @Override
  public native boolean recordUndo()/*-{
    return false;
  }-*/;

  @Override
  public native String getType()/*-{
    return this.type;
  }-*/;

  @Override
  public native <T> T as(Class<T> eventType)/*-{
    return eventType && eventType.jsType && eventType.jsType.prototype.type == this.type ?
      this : null;
  }-*/;

  @Override
  public native long getProjectId()/*-{
    return this.projectId;
  }-*/;

  @Override
  public native long getUserId()/*-{
    return this.userId;
  }-*/;

  @Override
  public native boolean isRealtime()/*-{
    return this.realtime;
  }-*/;

  @Override
  public native void setRealtime(boolean realtime)/*-{
    this.realtime = realtime;
  }-*/;

  @Override
  public native boolean isTransient()/*-{
    return !this.persist;
  }-*/;

}
