package com.google.appinventor.client.editor.youngandroid.events;

public interface AppInventorEvent {
  public boolean recordUndo();
  public String getType();
  public <T> T as(Class<T> eventType);
  public long getProjectId();
  public long getUserId();
  public boolean isRealtime();
  public void setRealtime(boolean realtime);
  public boolean isTransient();
}
