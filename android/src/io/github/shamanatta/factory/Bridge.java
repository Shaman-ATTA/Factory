package io.github.shamanatta.factory;
import android.content.Context;import android.os.Build;import android.os.VibrationEffect;import android.os.Vibrator;import android.webkit.JavascriptInterface;
public class Bridge{ private final Context c; public Bridge(Context c){this.c=c;}
  @JavascriptInterface public void vibrate(int ms){try{Vibrator v=(Vibrator)c.getSystemService(Context.VIBRATOR_SERVICE);if(v==null)return;ms=Math.max(1,Math.min(ms,1000));
    if(Build.VERSION.SDK_INT>=26)v.vibrate(VibrationEffect.createOneShot(ms,VibrationEffect.DEFAULT_AMPLITUDE));else v.vibrate(ms);}catch(Exception e){}} }
