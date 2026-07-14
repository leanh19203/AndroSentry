import { executeLocalCommand, CommandExecutionResult } from "./command.service";

export class FridaService {
  static async listProcesses(): Promise<CommandExecutionResult> {
    return executeLocalCommand("frida-ps -U");
  }

  static async injectScript(packageName: string, scriptPath: string): Promise<CommandExecutionResult> {
    return executeLocalCommand(`frida -U -f ${packageName} -l ${scriptPath}`);
  }
}
