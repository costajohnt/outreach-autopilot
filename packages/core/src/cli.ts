#!/usr/bin/env node
import { Command } from 'commander';
import { runTargetAdd } from './commands/target-add.js';
import { runTargetLog } from './commands/target-log.js';
import { runTargetList } from './commands/target-list.js';

const program = new Command();
program
  .name('outreach-autopilot')
  .description('AI-assisted LinkedIn outreach tooling')
  .version('0.1.0');

const target = program.command('target').description('Target management');

target
  .command('add')
  .description('Add a new outreach target')
  .requiredOption('--config <path>', 'path to config.json')
  .requiredOption('--name <name>')
  .requiredOption('--company <company>')
  .requiredOption('--role <role>')
  .requiredOption('--linkedin <url>')
  .action(async (opts) => {
    const result = await runTargetAdd(opts);
    console.log(JSON.stringify(result, null, 2));
  });

target
  .command('log')
  .description('Log engagement with a target')
  .requiredOption('--config <path>', 'path to config.json')
  .requiredOption('--slug <slug>', 'target slug')
  .requiredOption('--action <text>', 'what you did')
  .option('--date <YYYY-MM-DD>', 'date (default: today)')
  .action(async (opts) => {
    await runTargetLog(opts);
    console.log(`Logged engagement with ${opts.slug}`);
  });

target
  .command('list')
  .description('List all targets')
  .requiredOption('--config <path>', 'path to config.json')
  .action(async (opts) => {
    const result = await runTargetList(opts);
    console.log(JSON.stringify(result, null, 2));
  });

program.parseAsync().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
