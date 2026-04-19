#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();
program
  .name('outreach-autopilot')
  .description('AI-assisted LinkedIn outreach tooling')
  .version('0.1.0');

// Subcommands registered in later tasks

program.parse();
