import { executeLocalCommand, CommandExecutionResult } from "./command.service";

export class AdbService {
  static async listDevices(): Promise<CommandExecutionResult> {
    return executeLocalCommand("adb devices -l");
  }

  static async getSdkVersion(): Promise<CommandExecutionResult> {
    return executeLocalCommand("adb shell getprop ro.build.version.sdk");
  }

  static async listPackages(): Promise<CommandExecutionResult> {
    return executeLocalCommand("adb shell pm list packages");
  }

  static async getPackagePath(packageName: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`adb shell pm path ${packageName}`);
  }

  static async pullApk(devicePath: string, localPath: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`adb pull ${devicePath} ${localPath}`);
  }

  static async getLogcat(keyword?: string): Promise<CommandExecutionResult> {
    const filter = keyword ? ` | grep -i "${keyword}"` : "";
    return executeLocalCommand(`adb logcat -d${filter}`);
  }

  static async pullSandbox(packageName: string, localDir: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`adb pull /data/data/${packageName}/ ${localDir}`);
  }

  static async takeScreenshot(): Promise<CommandExecutionResult> {
    return executeLocalCommand("adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png .");
  }

  static async startActivity(packageName: string, activityName: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`adb shell am start -n ${packageName}/${activityName}`);
  }

  static async sendBroadcast(actionName: string, extras: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`adb shell am broadcast -a ${actionName} ${extras}`);
  }

  static async startService(packageName: string, serviceName: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`adb shell am startservice -n ${packageName}/${serviceName}`);
  }

  static async getRootStatus(): Promise<CommandExecutionResult> {
    return executeLocalCommand("adb shell \"su -c 'whoami'\"");
  }

  static async forwardPort(localPort: number, devicePort: number): Promise<CommandExecutionResult> {
    return executeLocalCommand(`adb forward tcp:${localPort} tcp:${devicePort}`);
  }

  static async checkOpenPorts(): Promise<CommandExecutionResult> {
    return executeLocalCommand("adb shell netstat -tuln");
  }
}
