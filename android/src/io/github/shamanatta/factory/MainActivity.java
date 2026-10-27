package io.github.shamanatta.factory;
import android.app.Activity;import android.app.AlertDialog;import android.os.Bundle;import android.view.View;import android.view.WindowManager;
import android.webkit.*;import android.os.Vibrator;import android.os.VibrationEffect;import android.content.Context;import android.os.Build;
public class MainActivity extends Activity {
  WebView w;
  @Override protected void onCreate(Bundle b){super.onCreate(b);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON|WindowManager.LayoutParams.FLAG_FULLSCREEN);
    w=new WebView(this);WebSettings s=w.getSettings();
    s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(true);s.setAllowFileAccess(true);
    s.setMediaPlaybackRequiresUserGesture(false);s.setUserAgentString(s.getUserAgentString()+" FactoryApp/13");
    w.setWebChromeClient(new WebChromeClient());w.setWebViewClient(new WebViewClient());
    w.addJavascriptInterface(new Bridge(this),"AndroidBridge");setContentView(w);immersive();
    if(b!=null)w.restoreState(b);else w.loadUrl("file:///android_asset/www/index.html");}
  void immersive(){w.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);}
  @Override public void onWindowFocusChanged(boolean f){super.onWindowFocusChanged(f);if(f)immersive();}
  @Override protected void onSaveInstanceState(Bundle o){super.onSaveInstanceState(o);w.saveState(o);}
  @Override protected void onPause(){super.onPause();w.evaluateJavascript("try{save()}catch(e){}",null);w.onPause();}
  @Override protected void onResume(){super.onResume();w.onResume();}
  @Override public void onBackPressed(){
    w.evaluateJavascript("(window.androidBack&&window.androidBack())?'1':'0'",r->{
      if(r!=null&&r.contains("1"))return;
      boolean ru=java.util.Locale.getDefault().getLanguage().equals("ru");new AlertDialog.Builder(this).setMessage(ru?"Выйти из игры?":"Exit the game?").setPositiveButton(ru?"Выйти":"Exit",(d,i)->finish()).setNegativeButton(ru?"Отмена":"Cancel",null).show();});}
}
