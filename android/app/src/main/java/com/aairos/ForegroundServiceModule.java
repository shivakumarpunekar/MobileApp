import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ForegroundServiceModule extends ReactContextBaseJavaModule {
    ForegroundServiceModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "ForegroundServiceModule";
    }

    @ReactMethod
    public void startService() {
        Intent serviceIntent = new Intent(getReactApplicationContext(), ForegroundService.class);
        getReactApplicationContext().startService(serviceIntent);
    }
}
