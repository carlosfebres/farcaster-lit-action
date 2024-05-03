import { Command } from "commander";

import { verifyCommand } from "./verify";

const program = new Command();

program.name("Lit <> Farcaster").version("1.0.0");

// Verify command
verifyCommand(program);

program.parse();
