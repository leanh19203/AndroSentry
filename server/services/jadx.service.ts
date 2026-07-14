import { executeLocalCommand, CommandExecutionResult } from "./command.service";

export class JadxService {
  static async runJadxGui(apkPath: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`jadx-gui ${apkPath}`);
  }

  static async decompileJava(apkPath: string, outputDir: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`jadx -d ${outputDir} ${apkPath}`);
  }
}
