import { executeLocalCommand, CommandExecutionResult } from "./command.service";

export class ApktoolService {
  static async decompile(apkName: string, outputDir: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`apktool d ${apkName} -o ${outputDir}`);
  }

  static async recompile(decompiledDir: string, outputFile: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`apktool b ${decompiledDir} -o ${outputFile}`);
  }

  static async generateKeystore(keystoreName: string, alias: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`keytool -genkey -v -keystore ${keystoreName} -keyalg RSA -keysize 2048 -validity 10000 -alias ${alias}`);
  }

  static async signApk(keystoreName: string, alias: string, apkPath: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`apksigner sign --keystore ${keystoreName} --ks-key-alias ${alias} ${apkPath}`);
  }
}
