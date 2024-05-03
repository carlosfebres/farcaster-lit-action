import { Command } from "commander";
import { verifySignature } from "../modules/farcaster/verifySignature";

export function verifyCommand(program: Command) {
  program
    .command("verify")
    .description("Verify Farcaster signature")
    .argument("<message>", "VerifySignInMessage")
    .action((message: string) => verifySignature(message));
}
